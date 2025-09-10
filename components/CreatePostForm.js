// 게시글 작성 폼 (2단계: 이미지 → 캡션)
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import ImageUpload from "./ImageUpload"
import { createPost } from "@/actions/posts"
import {
  Image as ImageIcon,
  Type,
  Send,
  ArrowLeft,
  CheckCircle,
  Hash,
  Smile
} from "lucide-react"

export default function CreatePostForm() {
  const [imageUrl, setImageUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(1) // 1: image, 2: caption
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!imageUrl) {
      alert("이미지를 먼저 업로드해주세요.")
      return
    }

    if (!caption.trim()) {
      alert("캡션을 입력해주세요.")
      return
    }

    startTransition(async () => {
      try {
        const result = await createPost({
          imageUrl,
          caption: caption.trim()
        })

        if (result.success) {
          setShowSuccess(true)
          setTimeout(() => {
            router.push("/")
          }, 2000)
        } else {
          alert("게시글 업로드에 실패했습니다: " + result.error)
        }
      } catch (error) {
        console.error("게시글 생성 오류:", error)
        alert("게시글 업로드 중 오류가 발생했습니다.")
      }
    })
  }

  const handleNext = () => {
    if (imageUrl) {
      setCurrentStep(2)
    } else {
      alert("먼저 이미지를 업로드해주세요.")
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
  }

  const goHome = () => {
    router.push("/")
  }

  // 성공 화면
  if (showSuccess) {
    return (
      <div className="text-center py-12 animate-bounceIn">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          게시글이 성공적으로 업로드되었습니다!
        </h3>
        <p className="text-gray-600 mb-4">
          곧 홈페이지로 이동합니다...
        </p>
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 진행 표시기 */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
            ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
          `}>
            <ImageIcon className="w-4 h-4" />
          </div>
          <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
            이미지 선택
          </span>
        </div>

        <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'} transition-colors duration-300`}></div>

        <div className="flex items-center space-x-2">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
            ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
          `}>
            <Type className="w-4 h-4" />
          </div>
          <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
            캡션 작성
          </span>
        </div>
      </div>

      {/* 1단계: 이미지 업로드 */}
      {currentStep === 1 && (
        <div className="animate-fadeIn">
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <span>사진 선택</span>
            </label>
            <p className="text-sm text-gray-600 mb-4">
              공유하고 싶은 멋진 사진을 선택해주세요
            </p>
            <ImageUpload
              onUploadComplete={setImageUrl}
              disabled={isPending}
            />
          </div>

          {imageUrl && (
            <div className="flex justify-end animate-slideInFromRight">
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <span>다음 단계</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2단계: 캡션 작성 */}
      {currentStep === 2 && (
        <div className="animate-fadeIn">
          <div className="mb-6">
            <label htmlFor="caption" className="block text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Type className="w-5 h-5 text-blue-600" />
              <span>캡션 작성</span>
            </label>
            <p className="text-sm text-gray-600 mb-4">
              이 순간에 대한 이야기를 들려주세요
            </p>

            <div className="relative">
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={isPending}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="이 순간에 대해 이야기해보세요...

#좋은하루 #행복 #일상 같은 해시태그도 추가해보세요!"
                maxLength={2200}
              />

              {/* 글자 수 */}
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                {caption.length}/2200
              </div>
            </div>

            {/* 해시태그 제안 */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2 flex items-center space-x-1">
                <Hash className="w-4 h-4" />
                <span>인기 해시태그</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {['#일상', '#행복', '#좋은하루', '#감사', '#친구', '#가족', '#여행', '#맛집'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!caption.includes(tag)) {
                        setCaption(prev => prev + (prev ? ' ' : '') + tag)
                      }
                    }}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={isPending}
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>이전</span>
            </button>

            <button
              type="submit"
              disabled={isPending || !imageUrl || !caption.trim()}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>게시 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>게시하기</span>
                </>
              )}
            </button>
          </div>

          {/* 취소 버튼 */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={goHome}
              disabled={isPending}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              취소하고 홈으로 돌아가기
            </button>
          </div>
        </div>
      )}

      {/* 2단계에서 이미지 미리보기 */}
      {currentStep === 2 && imageUrl && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg animate-scaleIn">
          <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
          <div className="aspect-square w-32 mx-auto rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="미리보기"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </form>
  )
}
