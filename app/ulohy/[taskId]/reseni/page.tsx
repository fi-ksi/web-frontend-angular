'use client';

import { useParams } from 'next/navigation';
import { PageTask } from '../../../../src/components/tasks/PageTask';

export default function Page() {
  const params = useParams();
  const taskId = Number(params.taskId);
  return <PageTask taskId={taskId} section="solution" />;
}
