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
    <Card>
      <CardContent className="p-0 px-5">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="m-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
                  {password.logoUrl ? (
                    <div className="relative h-6 w-6">
                      <Image
                        src={password.logoUrl}
                        alt={password.websiteName}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span className="text-lg font-bold uppercase text-muted-foreground">
                      {password.websiteName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {password.websiteName}
                    </span>
                    {password.isFavorite && (
                      <Star className="ml-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="space-y-2">
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
