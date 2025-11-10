import image from "public/images/profile.png"
import Header from "@/components/header";
import util from "@/util/util";
import Image from "next/image";


const Profile: React.FC = () => {
    return (
        <>
            <Header highlightedTitle="Profile" />
            <main className="flex flex-col items-center gap-4 p-6">
                <Image
                    src={image}
                    alt="Profile Picture"
                    width={150}
                    height={150}
                    className="rounded-full"
                />
                <p suppressHydrationWarning className="text-lg">
                    Welcome {util.getLoggedInCustomer().username}!
                </p>
            </main>
        </>
    );
};

export default Profile;