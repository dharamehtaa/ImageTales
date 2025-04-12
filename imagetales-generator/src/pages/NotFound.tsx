
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Button asChild>
        <Link to="/">
          Return Home
        </Link>
      </Button>
    </div>
  );
}
