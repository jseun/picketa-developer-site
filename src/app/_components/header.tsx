import Link from "next/link";
import SmallLogo from "@/assets/small-logo";

const Header = () => {
  return (
    <div className="mb-20 mt-8">
      <Link href="/" className="inline-block">
        <SmallLogo />
      </Link>
    </div>
  );
};

export default Header;
