
import { redirect } from "next/navigation";
import { isAuthenticated } from "../../lib/auth";

export default async function ProtectedLayout({ children }) {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
        redirect("/login");
    }

    return children;
}
