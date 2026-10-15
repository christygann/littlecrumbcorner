import lockupSrc from '@assets/logo-lockup-inline.png'

export default function Topbar({ showLogout, onLogout }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 sm:px-10 sm:py-5 border-b border-cocoa/10 bg-white">
      <img src={lockupSrc} alt="little crumb corner" className="h-[28px] sm:h-[32px] w-auto" />
      <div className="flex items-center gap-3">
        <span className="text-[10px] tracking-[0.25em] uppercase text-sage-dark font-medium">
          admin
        </span>
        {showLogout && (
          <button
            onClick={onLogout}
            className="py-[7px] px-4 rounded-full bg-transparent text-cocoa border border-cocoa/25 text-[10px] tracking-[0.25em] uppercase font-medium cursor-pointer hover:opacity-85 transition-opacity"
          >
            sign out
          </button>
        )}
      </div>
    </div>
  )
}
