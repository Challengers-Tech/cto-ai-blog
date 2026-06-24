import { test, expect } from '@playwright/test';

test.describe('Swarms.Guide E2E Validation Testing', () => {

  test('Page loads and verifies public view constraints (No private drafts leaked)', async ({ page }) => {
    // 1. Load the landing page
    await page.goto('/');
    await expect(page).toHaveTitle(/Swarms\.Guide/i);
    
    // Check that standard public navbar options are present
    const docsBtn = page.locator('button', { hasText: 'Docs' });
    const blogBtn = page.locator('button', { hasText: 'Blog' });
    const ownerHubBtn = page.locator('button', { hasText: 'Owner Hub' });
    
    await expect(docsBtn).toBeVisible();
    await bellIsVisible(page);

    // 2. Click Docs navigation and ensure we see published chapters
    await docsBtn.click();
    
    // Check if the documentation viewer is rendered
    await expect(page.locator('h2')).toContainText('Learn the Swarm Way');

    // 3. Click Blog navigation and verify drafts are excluded from public sight
    await blogBtnClick(page);
    
    // Query our backend blog endpoint directly from the browser to inspect items
    const blogResponse = await page.evaluate(async () => {
      const res = await fetch('/api/blog');
      return res.json();
    });

    // Verify draft visibility logic
    const hasDrafts = blogResponse.some((post: any) => post.status === 'draft');
    if (hasDrafts) {
      console.log('✓ API returned draft files for internal curation.');
    }

    // Ensure the public site lists only 'published' items
    const draftElements = page.locator('span', { hasText: 'DRAFT' });
    const count = await draftElements.count();
    expect(count).toBe(0); // Public view must NEVER leak private drafts!
  });

  test('Owner Hub Toggle, Draft Inspection, and Analytics Exclusion Verification', async ({ page }) => {
    await page.goto('/');
    
    // 1. Toggle Owner Hub (Partner Dashboard)
    const ownerHubBtn = page.locator('button', { hasText: 'Owner Hub' });
    await ownerHubBtn.click();
    
    // Check if the Dashboard is now visible
    await expect(page.locator('h2')).toContainText('Swarms.Guide Business Hub');
    
    // 2. Verify Analytics Exclusion (Owner mode) toggle is present and defaults to active
    const excludeCheckbox = page.locator('input[type="checkbox"]');
    await expect(excludeCheckbox).toBeChecked();
    
    // Read localStorage to confirm our dynamic 'exclude_analytics' state
    const excludeState = await page.evaluate(() => localStorage.getItem('exclude_analytics'));
    expect(excludeState).toBe('true'); // Owner actions are actively excluded!
    
    // 3. Inspect private drafts from the "Blog Content Hub" tab inside the hub
    const blogTab = page.locator('button', { hasText: 'Blog Content Hub' });
    await blogTab.click();
    
    // The Sovereign Office draft should be visible to the logged-in owner
    const sovereignDraft = page.locator('td', { hasText: 'The Sovereign Office' });
    await expect(sovereignDraft).toBeVisible();
    
    // 4. Toggle public site back
    const publicSiteBtn = page.locator('button', { hasText: 'Public Site' });
    await publicSiteBtn.click();
    await expect(page.locator('h2')).not.toContainText('Swarms.Guide Business Hub');
  });

});

// Helper utilities for E2E navigation flow
async function bellIsVisible(page: any) {
  const bell = page.locator('svg').first();
  await expect(bell).toBeVisible();
}

async function blogBtnClick(page: any) {
  const blogBtn = page.locator('button', { hasText: 'Blog' });
  await blogBtn.click();
}
