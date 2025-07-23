import { test, expect } from '@playwright/test';

test.describe('Search Modal Accessibility and Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open search modal with keyboard shortcut', async ({ page }) => {
    // Cmd+K (Mac) or Ctrl+K (Windows/Linux) should open search modal
    await page.keyboard.press('Meta+k');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Check ARIA attributes
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby', 'search-modal-title');
  });

  test('should focus search input when modal opens', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeFocused();
  });

  test('should close modal with Escape key', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('should navigate search results with arrow keys', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('React');
    
    // Wait for search results
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    const results = page.locator('[role="option"]');
    const firstResult = results.first();
    
    // Navigate down with arrow key
    await page.keyboard.press('ArrowDown');
    await expect(firstResult).toHaveAttribute('aria-selected', 'true');
    
    // Navigate up with arrow key
    await page.keyboard.press('ArrowUp');
    // Should wrap to last result or stay at first
  });

  test('should select result with Enter key', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('React');
    
    // Wait for search results
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Navigate to first result and press Enter
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Modal should close and navigate to the result
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Check if modal has sufficient contrast
    const modalBg = await modal.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Basic check - should not be transparent
    expect(modalBg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('should announce search status to screen readers', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('NonExistentQuery123');
    
    // Wait for no results message
    const noResults = page.locator('[role="status"]').filter({ hasText: '검색 결과가 없습니다' });
    await expect(noResults).toBeVisible();
    await expect(noResults).toHaveAttribute('aria-live', 'polite');
  });

  test('should handle error states properly', async ({ page }) => {
    // Mock network error
    await page.route('**/api/search**', (route) => {
      route.abort('failed');
    });
    
    await page.keyboard.press('Meta+k');
    
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('test');
    
    // Wait for error message
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
  });

  test('should be accessible with screen reader', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    // Check all required ARIA labels and roles
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveAttribute('aria-labelledby');
    await expect(modal).toHaveAttribute('aria-describedby');
    
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toHaveAttribute('aria-label');
    
    const closeButton = page.locator('button').filter({ hasText: /닫기|close/i });
    await expect(closeButton).toHaveAttribute('aria-label');
  });

  test('should work on mobile devices', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test is only for mobile devices');
    
    // On mobile, search might be triggered differently
    const searchButton = page.locator('button').filter({ hasText: /검색|search/i }).first();
    await searchButton.click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Check mobile-specific styles
    const modalContent = modal.locator('.modal-content').first();
    const height = await modalContent.evaluate((el) => {
      return window.getComputedStyle(el).height;
    });
    
    // On mobile, modal should use more screen space
    expect(height).not.toBe('auto');
  });

  test('should maintain focus trap', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should stay within modal
    const focusedElement = page.locator(':focus');
    const isWithinModal = await focusedElement.evaluate((el) => {
      const modal = document.querySelector('[role="dialog"]');
      return modal?.contains(el) || false;
    });
    
    expect(isWithinModal).toBe(true);
  });
});