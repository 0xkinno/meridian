import { listExecutions } from '@/lib/store/executions';
import { ExecutionsContainer } from '@/components/executions/ExecutionsContainer';

export const dynamic = 'force-dynamic';

export default async function ExecutionsPage() {
  const executions = await listExecutions();
  
  return (
    <div style={{ width: '100%' }}>
      <ExecutionsContainer initialExecutions={executions} />
    </div>
  );
}
