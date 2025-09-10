// 게시글 관련 서버 액션들
"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function createPost({ imageUrl, caption }) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session) {
      return { error: "로그인이 필요합니다" }
    }

    // 입력 데이터 검증
    if (!imageUrl || !imageUrl.trim()) {
      return { error: "이미지는 필수입니다" }
    }

    if (!caption || !caption.trim()) {
      return { error: "캡션은 필수입니다" }
    }

    if (caption.length > 2200) {
      return { error: "캡션은 2200자 이하여야 합니다" }
    }

    // URL 형식 검증
    try {
      new URL(imageUrl)
    } catch {
      return { error: "올바른 이미지 URL이 아닙니다" }
    }

    // 데이터베이스에 게시글 생성
    const post = await db.post.create({
      data: {
        caption: caption.trim(),
        imageUrl: imageUrl.trim(),
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    // 홈페이지 캐시 무효화 (새 게시글 반영)
    revalidatePath("/")

    console.log("새 게시글 생성됨:", post.id)
    return { success: true, post }

  } catch (error) {
    console.error("게시글 생성 오류:", error)

    // Prisma 에러 처리
    if (error.code === "P2002") {
      return { error: "중복된 데이터입니다" }
    }

    if (error.code === "P2025") {
      return { error: "사용자를 찾을 수 없습니다" }
    }

    return { error: "게시글 생성 중 오류가 발생했습니다" }
  }
}

// 좋아요 토글 함수
export async function toggleLike(postId) {
  try {
    console.log("❤️ 좋아요 토글 시작:", postId)

    // 로그인 확인
    const session = await getServerSession(authOptions)
    if (!session) {
      return { error: "로그인이 필요합니다" }
    }

    // 게시글 존재 확인
    const post = await db.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return { error: "게시글을 찾을 수 없습니다" }
    }

    // 기존 좋아요 확인
    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    })

    let isLiked

    if (existingLike) {
      // 이미 좋아요한 경우 → 좋아요 취소
      await db.like.delete({
        where: {
          id: existingLike.id
        }
      })
      isLiked = false
      console.log("💔 좋아요 취소됨")
    } else {
      // 좋아요하지 않은 경우 → 좋아요 추가
      await db.like.create({
        data: {
          userId: session.user.id,
          postId: postId
        }
      })
      isLiked = true
      console.log("💖 좋아요 추가됨")
    }

    // 총 좋아요 수 계산
    const likesCount = await db.like.count({
      where: { postId: postId }
    })

    console.log("✅ 현재 좋아요 수:", likesCount)

    // 홈페이지 캐시 무효화 (좋아요 변경사항 반영)
    revalidatePath("/")

    return {
      success: true,
      isLiked,
      likesCount
    }

  } catch (error) {
    console.error("❌ 좋아요 처리 오류:", error)

    // Prisma 에러 처리
    if (error.code === "P2002") {
      return { error: "이미 좋아요를 누르셨습니다" }
    }

    return { error: "좋아요 처리 중 오류가 발생했습니다" }
  }
}

// 댓글 작성 함수
export async function addComment(formData) {
  try {
    console.log("💬 댓글 작성 시작...")

    // 로그인 확인
    const session = await getServerSession(authOptions)
    if (!session) {
      return { error: "로그인이 필요합니다" }
    }

    // 폼 데이터 추출
    const postId = formData.get("postId")
    const content = formData.get("content")

    console.log("📝 댓글 데이터:", { postId, content })

    // 유효성 검사
    if (!postId) {
      return { error: "게시글 ID가 필요합니다" }
    }

    if (!content || !content.trim()) {
      return { error: "댓글 내용을 입력해주세요" }
    }

    if (content.length > 1000) {
      return { error: "댓글은 1000자 이하여야 합니다" }
    }

    // 게시글 존재 확인
    const post = await db.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return { error: "게시글을 찾을 수 없습니다" }
    }

    // 댓글 생성
    const comment = await db.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        postId: postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    console.log("✅ 댓글 생성 완료:", comment.id)

    // 홈페이지 캐시 무효화 (댓글 변경사항 반영)
    revalidatePath("/")

    return {
      success: true,
      comment: comment
    }

  } catch (error) {
    console.error("❌ 댓글 작성 오류:", error)

    // Prisma 에러 처리
    if (error.code === "P2025") {
      return { error: "게시글을 찾을 수 없습니다" }
    }

    return { error: "댓글 작성 중 오류가 발생했습니다" }
  }
}

// 댓글 삭제 함수
export async function deleteComment(commentId) {
  try {
    console.log("🗑️ 댓글 삭제 시작:", commentId)

    // 로그인 확인
    const session = await getServerSession(authOptions)
    if (!session) {
      return { error: "로그인이 필요합니다" }
    }

    // 댓글 조회 (권한 확인용)
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: {
            authorId: true
          }
        }
      }
    })

    if (!comment) {
      return { error: "댓글을 찾을 수 없습니다" }
    }

    // 삭제 권한 확인 (댓글 작성자 또는 게시글 작성자)
    const canDelete = comment.userId === session.user.id ||
                     comment.post.authorId === session.user.id

    if (!canDelete) {
      return { error: "댓글을 삭제할 권한이 없습니다" }
    }

    // 댓글 삭제
    await db.comment.delete({
      where: { id: commentId }
    })

    console.log("✅ 댓글 삭제 완료")

    // 홈페이지 캐시 무효화
    revalidatePath("/")

    return { success: true }

  } catch (error) {
    console.error("❌ 댓글 삭제 오류:", error)

    if (error.code === "P2025") {
      return { error: "댓글을 찾을 수 없습니다" }
    }

    return { error: "댓글 삭제 중 오류가 발생했습니다" }
  }
}

// 게시글 목록과 좋아요, 댓글 정보 가져오기 (팔로우 필터 추가)
export async function getPostsWithLikes(feedType = 'all') {
  try {
    const session = await getServerSession(authOptions)

    let whereCondition = {}

    // 피드 타입에 따른 필터링
    if (feedType === 'following' && session) {
      // 팔로우한 사용자들의 게시글만 가져오기
      const followingUsers = await db.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true }
      })

      const followingIds = followingUsers.map(f => f.followingId)

      // 팔로우한 사용자들 + 본인의 게시글
      whereCondition = {
        authorId: {
          in: [...followingIds, session.user.id]
        }
      }
    }
    // feedType이 'all'이면 모든 게시글 (기본값)

    // 게시글 목록 가져오기
    const posts = await db.post.findMany({
      where: whereCondition,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 현재 사용자가 각 게시글에 좋아요했는지 확인
    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: session ? post.likes.some(like => like.userId === session.user.id) : false,
      likes: undefined,
      _count: undefined
    }))

    return { success: true, posts: postsWithLikeStatus, feedType }

  } catch (error) {
    console.error("❌ 게시글 목록 조회 오류:", error)
    return { error: "게시글을 불러올 수 없습니다" }
  }
}
