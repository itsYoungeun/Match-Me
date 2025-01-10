import {
  Avatar,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Navbar,
    NavbarBrand,
    NavbarContent,
  } from "@nextui-org/react";
  import Link from "next/link";
  import React from "react";
  import { GiSelfLove } from "react-icons/gi";
  import NavLink from "./NavLink";
  import { auth } from "@/auth";
  import { Session } from "next-auth";

  type Props = {
    user: Session["user"];
  };

  export default function UserMenu({
    user,
  }: Props) {
    return (
      <Dropdown placement = "bottom-end">
        <DropdownTrigger>
          <Avatar
            isBordered
            as="button"
            className="transition-transform"
            color="secondary"
            name={user?.name || "user avatar"}
            size="sm"
            src={user?.image || "/images/user.png"}
          />
        </DropdownTrigger>
        <DropdownMenu
          variant="flat"
          aria-label="User actions menu"
        >
          <DropdownSection showDivider>
            <DropdownItem
              isReadOnly
              as="span"
              className="h-14 flex flex-row"
              aria-label="username"
            >
              Signed in as {user?.name}
            </DropdownItem>
          </DropdownSection>
          <DropdownItem
            as={Link}
            href="/members/edit"
          >
            Edit profile
          </DropdownItem>
          <DropdownItem
            color="danger"
            onClick={async () => signOutUser()}
          >
            Log out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
  }
  
  export default async function TopNav() {
    const session = await auth();
    return (
        <Navbar
          maxWidth="full"
          className="bg-gradient-to-r from-pink-400 via-red-400 to-pink-600"
          classNames={{
            item: [
              "text-xl",
              "text-white",
              "uppercase",
              "data-[active=true]:text-yellow-200",
            ],
          }}
        >
          <NavbarBrand as={Link} href="/">
            <GiSelfLove
              size={40}
              className="text-gray-200"
            />
            <div className="font-bold text-3xl flex">
              <span className="text-gray-200">
                MatchMe
              </span>
            </div>
          </NavbarBrand>
          <NavbarContent justify="center">
            <NavLink
                href="/members"
                label="Matches"
            />
            <NavLink href="/lists" label="Lists" />
            <NavLink
                href="/messages"
                label="Messages"
            />
            </NavbarContent>
            <NavbarContent justify="end">
              {session?.user ? (
                <UserMenu user={session.user} />
                ) : (
                  <>
                    <Button
                      as={Link}
                      href="/login"
                      variant="bordered"
                      className="text-white"
                    >
                      Login
                    </Button>
                    <Button
                      as={Link}
                      href="/register"
                      variant="bordered"
                      className="text-white"
                    >
                      Register
                    </Button>
                  </>
                )}
            </NavbarContent>
        </Navbar>
    );
  }