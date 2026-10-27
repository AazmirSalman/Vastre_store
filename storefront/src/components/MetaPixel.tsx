/**
 * Meta (Facebook/Instagram) Pixel base code. Rendered in <head> so it exists before the page's own
 * events fire. The ID comes from the Studio (Site settings), and only digits are accepted.
 */
export function MetaPixel({ id }: { id?: string }) {
  if (!id || !/^\d{5,20}$/.test(id)) return null
  const code =
    "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};" +
    "if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;" +
    "s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');" +
    `fbq('init','${id}');fbq('track','PageView');`
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: code }} />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: 'none' }} alt="" src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  )
}
