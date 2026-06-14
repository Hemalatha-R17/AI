import type { Job } from '../types';

export interface NotifSettings {
  browserEnabled: boolean;
  emailEnabled:   boolean;
  email:          string;
  ejsServiceId:   string;
  ejsTemplateId:  string;
  ejsPublicKey:   string;
  alertFollowUp:  boolean;
  alertInterview: boolean;
  alertOffer:     boolean;
}

export const DEFAULT_NOTIF: NotifSettings = {
  browserEnabled: false,
  emailEnabled:   false,
  email:          '',
  ejsServiceId:   '',
  ejsTemplateId:  '',
  ejsPublicKey:   '',
  alertFollowUp:  true,
  alertInterview: true,
  alertOffer:     true,
};

// ── Browser notifications ──────────────────────────────────────────────────

export async function requestBrowserPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const res = await Notification.requestPermission();
  return res === 'granted';
}

function browserNotify(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/favicon.svg' });
}

// ── EmailJS (no SDK needed — plain fetch) ─────────────────────────────────

async function sendEmail(s: NotifSettings, subject: string, message: string) {
  if (!s.emailEnabled || !s.email || !s.ejsServiceId || !s.ejsTemplateId || !s.ejsPublicKey) return;
  await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:      s.ejsServiceId,
      template_id:     s.ejsTemplateId,
      user_id:         s.ejsPublicKey,
      template_params: { to_email: s.email, subject, message },
    }),
  });
}

// ── Alert checker (called on app load, once per day) ──────────────────────

export async function checkJobAlerts(
  jobs: Job[],
  settings: NotifSettings,
  lastChecked: string,         // ISO date string stored in DB
  saveLastChecked: () => void,
): Promise<void> {
  const todayStr = new Date().toISOString().split('T')[0];
  if (lastChecked === todayStr) return;          // already notified today
  if (!settings.browserEnabled && !settings.emailEnabled) return;

  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
  const alerts: { title: string; body: string }[] = [];

  for (const job of jobs) {
    // Follow-up overdue or due today
    if (settings.alertFollowUp && job.followUpDate && job.followUpDate <= todayStr && job.followUpDate !== '') {
      const overdue = job.followUpDate < todayStr;
      alerts.push({
        title: `${overdue ? '⚠️ Overdue' : '📌 Due today'}: Follow-up — ${job.company}`,
        body:  `${job.role} at ${job.company} · follow-up was due ${job.followUpDate}`,
      });
    }

    // Interview today or tomorrow
    if (settings.alertInterview && job.status === 'Interview') {
      if (job.followUpDate === todayStr) {
        alerts.push({
          title: `🎯 Interview TODAY: ${job.company}`,
          body:  `${job.role}${job.interviewRound ? ` · ${job.interviewRound}` : ''}`,
        });
      } else if (job.followUpDate === tomorrow) {
        alerts.push({
          title: `📅 Interview tomorrow: ${job.company}`,
          body:  `${job.role}${job.interviewRound ? ` · ${job.interviewRound}` : ''}`,
        });
      }
    }

    // Phone Screen scheduled today/tomorrow
    if (settings.alertInterview && job.status === 'Phone Screen') {
      if (job.followUpDate === todayStr) {
        alerts.push({
          title: `📞 Phone Screen TODAY: ${job.company}`,
          body:  `${job.role}`,
        });
      }
    }

    // Offer received
    if (settings.alertOffer && (job.status === 'Offer' || job.status === 'Accepted')) {
      alerts.push({
        title: `🎉 ${job.status === 'Offer' ? 'Offer received' : 'Accepted'}: ${job.company}`,
        body:  `Congratulations on your ${job.role} offer!`,
      });
    }
  }

  if (alerts.length === 0) { saveLastChecked(); return; }

  // Browser
  if (settings.browserEnabled) {
    for (const a of alerts) browserNotify(a.title, a.body);
  }

  // Email digest
  if (settings.emailEnabled) {
    const subject = `CareerPulse: ${alerts.length} job alert${alerts.length > 1 ? 's' : ''} — ${todayStr}`;
    const message = alerts.map((a) => `${a.title}\n${a.body}`).join('\n\n---\n\n');
    await sendEmail(settings, subject, message);
  }

  saveLastChecked();
}

// ── Immediate status-change notification (no date guard) ──────────────────

export async function notifyStatusChange(
  job: Job,
  status: string,
  settings: NotifSettings,
): Promise<void> {
  if (!settings.alertOffer) return;
  if (!settings.browserEnabled && !settings.emailEnabled) return;
  if (status !== 'Offer' && status !== 'Accepted') return;

  const title = status === 'Offer'
    ? `🎉 Offer received: ${job.company}`
    : `✅ Accepted: ${job.company}`;
  const body = `Congratulations on your ${job.role} offer!`;

  if (settings.browserEnabled) browserNotify(title, body);
  if (settings.emailEnabled) {
    await sendEmail(settings, `CareerPulse: ${title}`, `${title}\n\n${body}`);
  }
}

// ── Test helper ───────────────────────────────────────────────────────────

export async function sendTestNotification(settings: NotifSettings): Promise<void> {
  if (settings.browserEnabled) {
    browserNotify('✅ CareerPulse notifications active', 'Browser alerts are working!');
  }
  if (settings.emailEnabled) {
    await sendEmail(
      settings,
      'CareerPulse — Test notification',
      'This is a test from CareerPulse. Your email notifications are set up correctly! 🎉',
    );
  }
}
