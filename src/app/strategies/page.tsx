import { listStrategies } from '@/lib/store/strategies';
import { StrategiesContainer } from '@/components/strategies/StrategiesContainer';

export const dynamic = 'force-dynamic';

export default async function StrategiesPage() {
  const strategies = await listStrategies();
  
  return (
    <div style={{ width: '100%' }}>
      <StrategiesContainer initialStrategies={strategies} />
    </div>
  );
}
