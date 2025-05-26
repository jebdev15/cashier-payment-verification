export const LazyImage = ({ src, alt, height, width }: { src: string, alt: string, height?: number | string, width?: number | string }) => {
    return (
        <img 
            className="chmsulogo"
            src={src} 
            alt={alt} 
            height={height} 
            width={width} 
            loading="lazy" 
        />
    )
}