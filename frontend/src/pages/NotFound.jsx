import { useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
    const navigate = useNavigate();

    const MarqueeText = () => (
        <>
            <span>PAGE NOT FOUND</span>
            <span>PAGE NOT FOUND</span>
            <span>PAGE NOT FOUND</span>
            <span>PAGE NOT FOUND</span>
            <span>PAGE NOT FOUND</span>
            <span>PAGE NOT FOUND</span>
            <span>PAGE NOT FOUND</span>
            <span>PAGE NOT FOUND</span>
        </>
    );

    return (
        <div className="notfound-container">
            <div className="marquee-wrapper">
                <div className="marquee marquee-large">
                    <div className="marquee-content">
                        <MarqueeText />
                    </div>
                    <div className="marquee-content" aria-hidden="true">
                        <MarqueeText />
                    </div>
                </div>

                <div className="marquee marquee-small">
                    <div className="marquee-content">
                        <MarqueeText />
                    </div>
                    <div className="marquee-content" aria-hidden="true">
                        <MarqueeText />
                    </div>
                </div>

                <div className="marquee marquee-large reverse">
                    <div className="marquee-content">
                        <MarqueeText />
                    </div>
                    <div className="marquee-content" aria-hidden="true">
                        <MarqueeText />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotFound;