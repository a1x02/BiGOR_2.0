import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ["latin"],
    weight: ["400", "700"]
})

export const Logo = () => {
    return ( 
        <div className="hidden md:flex items-center gap-x-2">
            <Image 
                src="/logo.svg"
                alt="logo"
                height="40"
                width="40"
            />
            {/* <p className={cn("font-bold", font.className)}></p> */}
        </div>
     );
}
 
export default Logo;