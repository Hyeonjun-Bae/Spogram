// UploadThing API 라우트 핸들러
import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "@/lib/uploadthing-server"

const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
})

export { GET, POST }
