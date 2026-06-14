import { test, expect, Page } from '@playwright/test';
import * as path from 'path';

const SS = (name: string) => path.join('screenshots', `${String(Date.now()).slice(-5)}_${name}.png`);

// ── Helpers ──────────────────────────────────────────────────────────────────

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: SS(name), fullPage: false });
}

async function enterApp(page: Page, name = 'Hema') {
  await page.goto('/');
  await page.waitForSelector('text=Enter CareerPulse');
  await screenshot(page, '01_landing');

  const nameInput = page.locator('input[placeholder*="Alex"], input[placeholder*="name"], input[type="text"]').first();
  if (await nameInput.isVisible()) {
    await nameInput.fill(name);
  }
  await page.click('button:has-text("Enter CareerPulse")');

  // Welcome splash
  await page.waitForSelector('text=Welcome', { timeout: 5000 }).catch(() => {});
  await screenshot(page, '02_welcome_splash');

  // Wait for dashboard to load
  await page.waitForSelector('text=Dashboard', { timeout: 8000 });
  await page.waitForTimeout(500);
}

async function clickNav(page: Page, label: string) {
  await page.click(`button:has-text("${label}")`);
  await page.waitForTimeout(600);
}

// ── Clear IndexedDB so seed data loads fresh ─────────────────────────────────

async function clearDB(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('careerpulse');
      req.onsuccess = () => resolve();
      req.onerror   = () => resolve();
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOUR START
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('CareerPulse — Full Demo Tour', () => {
  test.beforeEach(async ({ page }) => {
    await clearDB(page);
  });

  // ── 1. Landing & Welcome ──────────────────────────────────────────────────

  test('01 — Landing page and welcome splash', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=CareerPulse').first()).toBeVisible();
    await expect(page.locator('text=Track every application').first()).toBeVisible();
    await expect(page.locator('text=100% Local').first()).toBeVisible();
    await expect(page.locator('text=Zero Cloud').first()).toBeVisible();
    await expect(page.locator('text=AI-Powered').first()).toBeVisible();
    await screenshot(page, '01_landing_full');

    // Enter name
    const input = page.locator('input').first();
    await input.fill('Hema');
    await screenshot(page, '02_landing_name_entered');

    await page.click('button:has-text("Enter CareerPulse")');

    // Welcome splash
    await page.waitForTimeout(400);
    await screenshot(page, '03_welcome_splash');
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 4000 });
    await expect(page.locator('text=Hema')).toBeVisible();

    // Dashboard loads after splash
    await page.waitForSelector('text=Dashboard', { timeout: 8000 });
    await screenshot(page, '04_dashboard_loaded');
  });

  // ── 2. Dashboard ──────────────────────────────────────────────────────────

  test('02 — Dashboard stats and job list', async ({ page }) => {
    await enterApp(page);
    await screenshot(page, '05_dashboard_overview');

    // Dashboard loaded — stat cards visible (Total card confirmed by DOM)
    await expect(page.locator('text=Total').first()).toBeVisible({ timeout: 6000 });
    await screenshot(page, '06_dashboard_stats');
  });

  // ── 3. Add a new job ──────────────────────────────────────────────────────

  test('03 — Add new job application', async ({ page }) => {
    await enterApp(page);

    // Find and click Add button
    const addBtn = page.locator('button:has-text("Add"), button[title*="Add"], button:has-text("+")').first();
    await addBtn.click();
    await page.waitForTimeout(400);
    await screenshot(page, '07_add_modal_open');

    // Fill company
    const companyInput = page.locator('input[placeholder*="company"], input[placeholder*="Company"]').first();
    if (await companyInput.isVisible()) {
      await companyInput.fill('Google');
    }

    // Fill role
    const roleInput = page.locator('input[placeholder*="role"], input[placeholder*="Role"], input[placeholder*="position"]').first();
    if (await roleInput.isVisible()) {
      await roleInput.fill('Senior QA Automation Engineer');
    }

    await screenshot(page, '08_add_modal_filled');

    // Save via Ctrl+Enter keyboard shortcut (avoids backdrop intercept issue)
    await page.keyboard.press('Control+Enter');
    await page.waitForTimeout(600);
    await screenshot(page, '09_job_added');
  });

  // ── 4. Pipeline (Kanban) ──────────────────────────────────────────────────

  test('04 — Pipeline Kanban view', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Pipeline');
    await screenshot(page, '10_pipeline_kanban');

    // Verify kanban columns exist
    const statuses = ['Saved', 'Submitted', 'Interview', 'Offer'];
    for (const s of statuses) {
      await expect(page.locator(`text=${s}`).first()).toBeVisible();
    }
    await screenshot(page, '11_pipeline_columns');
  });

  // ── 5. Directory (Table view) ─────────────────────────────────────────────

  test('05 — Directory table view', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Directory');
    await screenshot(page, '12_directory_table');

    // Verify table headers (use th to avoid matching hidden <option> elements)
    await expect(page.locator('th').filter({ hasText: 'Company' }).first()).toBeVisible();
    await screenshot(page, '13_directory_columns');
  });

  // ── 6. Calendars ──────────────────────────────────────────────────────────

  test('06 — Calendars view', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Calendars');
    await screenshot(page, '14_calendars');
    await page.waitForTimeout(500);
    await screenshot(page, '15_calendars_loaded');
  });

  // ── 7. Analytics ──────────────────────────────────────────────────────────

  test('07 — Analytics & Funnels', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Analytics');
    await screenshot(page, '16_analytics');
    await page.waitForTimeout(800);
    await screenshot(page, '17_analytics_charts');
  });

  // ── 8. Resume Studio ──────────────────────────────────────────────────────

  test('08 — Resume Studio', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Resume Studio');
    await screenshot(page, '18_resume_studio');
    await page.waitForTimeout(500);

    // Try clicking tabs if they exist
    const skillTab = page.locator('button:has-text("Skill Profile"), [role="tab"]:has-text("Skill")').first();
    if (await skillTab.isVisible()) {
      await skillTab.click();
      await page.waitForTimeout(300);
      await screenshot(page, '19_resume_skill_profile');
    }

    const resumeTab = page.locator('button:has-text("Master Resume"), [role="tab"]:has-text("Resume")').first();
    if (await resumeTab.isVisible()) {
      await resumeTab.click();
      await page.waitForTimeout(300);
      await screenshot(page, '20_resume_master');
    }
  });

  // ── 9. Interview Prep ─────────────────────────────────────────────────────

  test('09 — Interview Prep', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Interview Prep');
    await screenshot(page, '21_interview_prep');
    await page.waitForTimeout(500);
    await screenshot(page, '22_interview_prep_loaded');
  });

  // ── 10. Job Discovery ────────────────────────────────────────────────────

  test('10 — Job Discovery', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Job Discovery');
    await screenshot(page, '23_job_discovery');
    await page.waitForTimeout(500);
    await screenshot(page, '24_job_discovery_loaded');
  });

  // ── 11. Cover Letter Gen ─────────────────────────────────────────────────

  test('11 — Cover Letter Generator', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Cover Letter Gen');
    await screenshot(page, '25_cover_letter');
    await page.waitForTimeout(500);
    await screenshot(page, '26_cover_letter_loaded');

    // Verify two-panel layout
    await expect(page.locator('textarea').first()).toBeVisible();
  });

  // ── 12. Settings — AI Providers ──────────────────────────────────────────

  test('12 — Settings AI providers and notifications', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Settings');
    await screenshot(page, '27_settings');
    await page.waitForTimeout(500);

    // Verify AI Providers section
    await expect(page.locator('text=AI Providers').first()).toBeVisible();
    await screenshot(page, '28_settings_ai_providers');

    // Scroll down to notifications
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await screenshot(page, '29_settings_notifications');
  });

  // ── 13. Theme Studio ─────────────────────────────────────────────────────

  test('13 — Theme Studio', async ({ page }) => {
    await enterApp(page);

    // Click Theme Studio in sidebar bottom
    const themeBtn = page.locator('button:has-text("Theme Studio")').first();
    await themeBtn.click();
    await page.waitForTimeout(500);
    await screenshot(page, '30_theme_studio_open');

    // Close it
    const closeBtn = page.locator('button:has-text("Close"), button[aria-label*="close"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  // ── 14. AI Assistant Panel ───────────────────────────────────────────────

  test('14 — AI Assistant panel', async ({ page }) => {
    await enterApp(page);

    const aiBtn = page.locator('button:has-text("AI Assistant")').first();
    await aiBtn.click();
    await page.waitForTimeout(500);
    await screenshot(page, '31_ai_panel_open');

    await expect(page.locator('text=AI Assistant').first()).toBeVisible();
  });

  // ── 15. Edit existing job ────────────────────────────────────────────────

  test('15 — Edit job and view cover letter section', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Directory');
    await page.waitForTimeout(500);

    // Click first job row or edit button
    const editBtn = page.locator('button[title*="Edit"], button:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(400);
      await screenshot(page, '32_edit_modal');

      // Scroll to cover letter section
      await page.evaluate(() => {
        const el = document.querySelector('[data-section="coverletter"], textarea');
        el?.scrollIntoView();
      });
      await screenshot(page, '33_edit_modal_coverletter');
    }
  });

  // ── 16. Offer confetti ───────────────────────────────────────────────────

  test('16 — Move job to Offer (confetti test)', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Directory');
    await page.waitForTimeout(500);

    // Try to find a status dropdown to change to Offer
    const statusSelect = page.locator('select').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('Offer');
      await page.waitForTimeout(800);
      await screenshot(page, '34_offer_confetti');
    } else {
      // Try right-click or move button on pipeline
      await clickNav(page, 'Pipeline');
      await page.waitForTimeout(500);
      await screenshot(page, '34_pipeline_for_offer');
    }
  });

  // ── 17. Bulk actions ────────────────────────────────────────────────────

  test('17 — Bulk select in Directory', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Directory');
    await page.waitForTimeout(500);

    // Check first checkbox
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.click();
      await page.waitForTimeout(300);
      await screenshot(page, '35_bulk_selected');

      // Second checkbox
      const secondCheckbox = page.locator('input[type="checkbox"]').nth(1);
      if (await secondCheckbox.isVisible()) {
        await secondCheckbox.click();
        await page.waitForTimeout(300);
        await screenshot(page, '36_bulk_multi_selected');
      }
    }
  });

  // ── 18. Export data ──────────────────────────────────────────────────────

  test('18 — Export data from Settings', async ({ page }) => {
    await enterApp(page);
    await clickNav(page, 'Settings');
    await page.waitForTimeout(500);

    const exportBtn = page.locator('button:has-text("Export")').first();
    if (await exportBtn.isVisible()) {
      await screenshot(page, '37_settings_export');
    }
  });

  // ── 19. Dark / Light theme switch ───────────────────────────────────────

  test('19 — Theme switch in Theme Studio', async ({ page }) => {
    await enterApp(page);

    await page.click('button:has-text("Theme Studio")');
    await page.waitForTimeout(500);
    await screenshot(page, '38_theme_studio');

    // Click a light theme option if visible
    const lightTheme = page.locator('text=Light, text=Arctic, text=Ivory').first();
    if (await lightTheme.isVisible()) {
      await lightTheme.click();
      await page.waitForTimeout(400);
      await screenshot(page, '39_light_theme_applied');
    }
  });

  // ── 20. Full app navigation tour ────────────────────────────────────────

  test('20 — Full sidebar navigation tour', async ({ page }) => {
    await enterApp(page);

    const navItems = [
      'Dashboard', 'Pipeline', 'Directory', 'Calendars',
      'Analytics', 'Resume Studio', 'Interview Prep',
      'Job Discovery', 'Cover Letter Gen', 'Settings',
    ];

    for (let i = 0; i < navItems.length; i++) {
      const label = navItems[i];
      await clickNav(page, label);
      await page.waitForTimeout(400);
      await screenshot(page, `40_nav_${String(i + 1).padStart(2, '0')}_${label.replace(/\s+/g, '_').toLowerCase()}`);
    }
  });
});
