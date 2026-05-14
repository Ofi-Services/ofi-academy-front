import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Search, Route as RouteIcon } from 'lucide-react';
import TrainingCatalogTab from '../components/TrainingCatalogTab';
import RoadmapsTab from '../components/RoadmapsTab';

const TAB_VALUES = ['catalog', 'roadmaps'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function resolveTab(raw: string | null): TabValue {
  return TAB_VALUES.includes(raw as TabValue) ? (raw as TabValue) : 'catalog';
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveTab(searchParams.get('tab'));

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'catalog') {
      next.delete('tab');
    } else {
      next.set('tab', value);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0 gap-0">
          <TabsTrigger
            value="catalog"
            className="gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary font-medium"
          >
            <Search className="w-4 h-4" />
            Training Catalog
          </TabsTrigger>
          <TabsTrigger
            value="roadmaps"
            className="gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary font-medium"
          >
            <RouteIcon className="w-4 h-4" />
            Roadmaps
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-0">
          <TrainingCatalogTab />
        </TabsContent>

        <TabsContent value="roadmaps" className="mt-0">
          <RoadmapsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
