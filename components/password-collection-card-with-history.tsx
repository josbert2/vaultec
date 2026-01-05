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
import { Star, Folder, Shield, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";
import { BreachBadge } from "./breach-badge";
import { FavoriteButton } from "./favorite-button";

interface PasswordCollectionCardWithHistoryProps {
  categories: Category[];
  folders: any[];
  tags: any[];
  password: Prisma.PasswordGetPayload<{
    include: {
      category: true;
      folder: true;
      tags: {
        include: {
          tag: true;
        };
      };
    };
  }>;
}

const PasswordCollectionCardWithHistory = async ({
  password,
  categories,
  folders,
  tags,
}: PasswordCollectionCardWithHistoryProps) => {
  const decryptPassword = cryptr.decrypt(password.password);

  // Fetch password history
  let history: Awaited<ReturnType<typeof getPasswordHistory>> = [];
  try {
    history = await getPasswordHistory(password.id);
  } catch (error) {
    console.error("Failed to load history:", error);
  }

  // Security score color
  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number | null) => {
    if (!score) return Shield;
    if (score >= 80) return CheckCircle2;
    if (score >= 40) return Shield;
    return AlertTriangle;
  };

  const ScoreIcon = getScoreIcon(password.securityScore);

  return (
    <Card className="rounded-none border-border bg-card transition-all hover:border-muted-foreground/20 hover:shadow-md">
      <CardContent className="p-0 px-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="m-0 hover:no-underline">
              <div className="flex w-full items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-md border border-border bg-background">
                  {password.logoUrl ? (
                    <div className="relative h-8 w-8">
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
                      className="h-8 w-8 text-foreground"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col items-start gap-2">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold capitalize tracking-tight text-foreground">
                        {password.websiteName}
                      </span>
                      {password.isFavorite && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>

                    {/* Security Score */}
                    {password.securityScore !== null && (
                      <div className={`flex items-center gap-1 ${getScoreColor(password.securityScore)}`}>
                        <ScoreIcon className="h-4 w-4" />
                        <span className="text-sm font-semibold">{password.securityScore}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-2">
                    {/* URL */}
                    <small className="text-sm text-muted-foreground">
                      {password.url || "No URL"}
                    </small>

                    {/* Folder */}
                    {password.folder && (
                      <Badge
                        variant="outline"
                        className="gap-1 rounded-sm border-border text-xs"
                        style={{ borderColor: password.folder.color || "#3b82f6" }}
                      >
                        <Folder className="h-3 w-3" style={{ color: password.folder.color || "#3b82f6" }} />
                        {password.folder.name}
                      </Badge>
                    )}

                    {/* Tags */}
                    {password.tags.map((pt) => (
                      <Badge
                        key={pt.id}
                        variant="outline"
                        className="gap-1 rounded-sm border-border text-xs"
                        style={{ borderColor: pt.tag.color || "#3b82f6" }}
                      >
                        {pt.tag.name}
                      </Badge>
                    ))}

                    {/* Breach Badge */}
                    <BreachBadge
                      isBreached={password.isBreached}
                      breachCount={password.breachCount}
                    />

                    {/* Last Changed */}
                    {password.lastChanged && (
                      <Badge variant="outline" className="gap-1 rounded-sm text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(password.lastChanged), { addSuffix: true })}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="space-y-3 pb-4">
              <PasswordContent
                password={{ ...password, password: decryptPassword }}
              />
              <div className="flex items-center space-x-3 px-2">
                <FavoriteButton
                  passwordId={password.id}
                  isFavorite={password.isFavorite}
                  size="sm"
                />
                <DeletePasswordAlertDialog passwordId={password.id} />
                <EditPasswordDialog
                  categories={categories}
                  folders={folders}
                  tags={tags}
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
