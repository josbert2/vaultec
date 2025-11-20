import { Category, Prisma } from "@prisma/client";
import Image from "next/image";
import { getPasswordHistory } from "@/actions/password-history-action";
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
import PasswordHistoryDialog from "./password-history-dialog";
import { cryptr } from "@/lib/crypto";

interface PasswordCollectionCardWithHistoryProps {
  categories: Category[];
  password: Prisma.PasswordGetPayload<{
    include: {
      category: true;
    };
  }>;
}

const PasswordCollectionCardWithHistory = async ({
  password,
  categories,
}: PasswordCollectionCardWithHistoryProps) => {
  const decryptPassword = cryptr.decrypt(password.password);

  // Fetch password history
  let history: Awaited<ReturnType<typeof getPasswordHistory>> = [];
  try {
    history = await getPasswordHistory(password.id);
  } catch (error) {
    console.error("Failed to load history:", error);
  }

  return (
    <Card>
      <CardContent className="p-0 px-5">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="m-0">
              <div className="inline-flex text-sm capitalize items-center">
                {password.logoUrl ? (
                  <div className="mr-3 relative h-6 w-6">
                    <Image
                      src={password.logoUrl}
                      alt={password.websiteName}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <CategoryIcon
                    category={password.category.slug}
                    className="mr-3 h-6 w-6"
                  />
                )}
                <div className="flex flex-col items-start gap-1">
                  <span>{password.websiteName}</span>
                  <small className="text-xs text-muted-foreground">
                    {password.url}
                  </small>
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
                <PasswordHistoryDialog
                  passwordId={password.id}
                  history={history}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PasswordCollectionCardWithHistory;
