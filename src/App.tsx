 import { Plus } from "lucide-react";
 import { Dashboard } from "@/components/dashboard";
 import {
   AppNav,
   AppShell,
   PageHeader,
 } from "@/components/layout";
 import { Button } from "@/components/ui";
 import { loadCollection } from "@/storage";
 const navigationItems = [
   { label: "Collection", value: "collection" },
   { label: "Reminders", value: "reminders" },
   { label: "Settings", value: "settings" },
 ];
 export default function App() {
   const collectionResult = loadCollection();
   const specimens = collectionResult.success
     ? collectionResult.data
     : [];
   const loadError = collectionResult.success
     ? null
     : collectionResult.error;
   return (
     <AppShell
       navigation={
         <AppNav
           items={navigationItems}
           activeItem="collection"
         />
       }
       actions={
         <Button
           size="compact"
           leadingIcon={<Plus size={16} />}
         >
           Add specimen
         </Button>
       }
     >
       <PageHeader
         eyebrow="Personal Herbarium"
         title="Collection"
         description="A quiet archive for documenting, studying, and caring for your botanical specimens."
       />
       <Dashboard
         specimens={specimens}
         loadError={loadError}
       />
     </AppShell>
   );
  }