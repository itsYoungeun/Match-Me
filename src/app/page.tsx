import { Button, Link } from "@nextui-org/react";
import { GoSmiley } from "react-icons/go";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl">hello</h1>
      <Button 
        as={Link}
        href="/members"
        color="primary" 
        variant="bordered"
        startContent={<GoSmiley />}
      >
        Click me
      </Button>
    </div>
  );
}
