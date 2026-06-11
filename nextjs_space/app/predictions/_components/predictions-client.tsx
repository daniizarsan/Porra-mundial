'use client';
import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, GitBranch, Star } from 'lucide-react';
import { GroupPredictions } from './group-predictions';
import { BracketPredictions } from './bracket-predictions';
import { BonusPredictions } from './bonus-predictions';
import { ScoringInfo } from '@/components/scoring-info';

export function PredictionsClient() {
  const [tab, setTab] = useState('groups');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Predicciones</h1>
        <p className="text-muted-foreground mb-4">Haz tus predicciones para cada fase del Mundial 2026</p>

        <div className="mb-6">
          <ScoringInfo />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="groups" className="gap-2">
              <Target className="h-4 w-4" /> Fase de Grupos
            </TabsTrigger>
            <TabsTrigger value="bracket" className="gap-2">
              <GitBranch className="h-4 w-4" /> Eliminatorias
            </TabsTrigger>
            <TabsTrigger value="bonus" className="gap-2">
              <Star className="h-4 w-4" /> Quiz Bonus
            </TabsTrigger>
          </TabsList>
          <TabsContent value="groups">
            <GroupPredictions />
          </TabsContent>
          <TabsContent value="bracket">
            <BracketPredictions />
          </TabsContent>
          <TabsContent value="bonus">
            <BonusPredictions />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
