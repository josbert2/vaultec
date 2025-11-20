import { getCategories } from "@/actions/category-action";
import {
  getPasswordCollection,
  totalUserPasswordSaved,
} from "@/actions/password-action";
import { getFolders } from "@/actions/folder-action";
import { getTags } from "@/actions/tag-action";
import AddNewPasswordDialog from "@/components/add-new-password-dialog";
import Header from "@/components/header";
import PasswordCollectionCardWithHistory from "@/components/password-collection-card-with-history";
import SearchPassword from "@/components/search-password";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface DashboarPageProps {
  searchParams: {
    category?: string;
    search?: string;
    folder?: string;
    tag?: string;
  };
}

const DashboardPage = async ({
  searchParams: { category, search, folder, tag },
}: DashboarPageProps) => {
  const [passwordsCollection, categories, total, folders, tags] = await Promise.all([
    getPasswordCollection({
      category: category as string,
      search: search as string,
      folder: folder as string,
      tag: tag as string,
    }),
    getCategories(),
    totalUserPasswordSaved(),
    getFolders(),
    getTags(),
  ]);

  return (
    <>
      <Header
        title="All Passwords"
        description="Safely manage and access your passwords."
        className="mt-6"
      />

      <div className="mb-8 flex items-center space-x-3">
        <SearchPassword total={total} />
        <AddNewPasswordDialog categories={categories} folders={folders} tags={tags} />
      </div>

      <div className="space-y-3">
        {!passwordsCollection.length ? (
          <Alert variant="destructive" className="rounded-none border-border bg-card">
            <Terminal className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">No Password Found</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Looks like you haven&apos;t added any passwords yet.
            </AlertDescription>
          </Alert>
        ) : (
          passwordsCollection.map((collection, index) => (
            <PasswordCollectionCardWithHistory
              key={index}
              password={collection}
              categories={categories}
              folders={folders}
              tags={tags}
            />
          ))
        )}
      </div>
    </>
  );
};

export default DashboardPage;
