// ===================================================================
// Visalink Air - Shared Logo component
// এক জায়গায় লোগো — সব জায়গায় একই ভাবে ব্যবহার হবে
//
// `/images/logo.png` (473×528 transparent PNG). Rendered as a plain
// <img> tag so className-based sizing (h-16, h-20, etc.) works
// reliably across the site. Native `width`/`height` are set so the
// browser reserves layout space and picks a crisp downscale.
// ===================================================================

export default function Logo({
    className = "h-16 w-auto",
    alt = "Visalink Air",
}) {
    return (
        <img
            src="/images/logo.png"
            alt={alt}
            width={473}
            height={528}
            className={`${className} object-contain select-none`}
            draggable={false}
        />
    );
}
