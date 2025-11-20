import { Category, Prisma } from "@prisma/client";
import CategoryIcon from "./category-icon";
import DeletePasswordAlertDialog from "./delete-password-alert-dialog";
import PasswordContent from "./password-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Card, CardContent } from "./ui/card";
import EditPasswordDialog from "./edit-password-dialog";
import { Password } from "@prisma/client";
import { Copy, MoreHorizontal, Star } from "lucide-react";
import Image from "next/image";
import { cryptr } from "@/lib/crypto";

interface PasswordCollectionCardProps {
  categories: Category[];
  password: Prisma.PasswordGetPayload<{
    include: {
      category: true;
    };
  }>;
}

const PasswordCollectionCard = ({
  password,
  categories,
}: PasswordCollectionCardProps) => {
  const decryptPassword = cryptr.decrypt(password.password);

  return (
    <Card className="rounded-none border-border bg-card transition-colors hover:border-muted-foreground/20">
      <CardContent className="p-0 px-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="m-0 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-none border border-border bg-background">
                  {password.logoUrl ? (
                    <div className="relative h-7 w-7">
                      <Image
                        src={password.logoUrl}
                        alt={password.websiteName}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span className="text-xl font-bold uppercase text-foreground">
                      {password.websiteName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold capitalize tracking-tight text-foreground">
                      {password.websiteName}
                    </span>
                    {password.isFavorite && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {password.email || password.username || "No credentials"}
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="space-y-3 pb-4">
              <PasswordContent
                password={{ ...password, password: decryptPassword }}
              />
              <div className="flex items-center space-x-3 px-2">
                <DeletePasswordAlertDialog passwordId={password.id} />
                <EditPasswordDialog
                  categories={categories}
                  password={{ ...password, password: decryptPassword }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PasswordCollectionCard;
