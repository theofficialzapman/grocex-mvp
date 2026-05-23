import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_i8xrzcs';
const TEMPLATE_ID = 'template_z6aa8y8';
const PUBLIC_KEY = 'Ri3hxSU2HegLFYmPw';

export interface TaskEmailParams {
  assignee_name: string;
  assignee_email: string;
  task_item: string;
  task_action: string;
  task_due_date: string;
  task_notes: string;
  store_name: string;
}

export async function sendTaskAssignmentEmail(params: TaskEmailParams): Promise<boolean> {
  if (!params.assignee_email || !params.assignee_email.includes('@')) return false;
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      assignee_name: params.assignee_name,
      assignee_email: params.assignee_email,
      task_item: params.task_item,
      task_action: params.task_action,
      task_due_date: params.task_due_date,
      task_notes: params.task_notes || 'No notes',
      store_name: params.store_name || 'Grocex Store',
    }, PUBLIC_KEY);
    return true;
  } catch {
    return false;
  }
}
