import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CycleTimeline } from '../CycleTimeline';
import type { CalendarEvent } from '../../../types';

describe('CycleTimeline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the heading', () => {
    render(<CycleTimeline calendarEvents={[]} />);
    expect(screen.getByRole('heading', { name: /cycle timeline/i })).toBeInTheDocument();
  });

  it('renders an empty state gracefully', () => {
    const { container } = render(<CycleTimeline calendarEvents={[]} />);
    // There's one main container for the timeline events.
    // The relative timeline line is there, but no child events.
    expect(container.querySelectorAll('.relative.pl-6 > .relative')).toHaveLength(0);
  });

  it('renders a list of calendar events with correct styles based on time', () => {
    const events: CalendarEvent[] = [
      {
        id: 'past-event',
        title: 'Past Event',
        date: new Date('2023-10-10T12:00:00Z'),
        type: 'meeting',
      },
      {
        id: 'current-event',
        title: 'Current Event',
        date: new Date('2023-10-15T18:00:00Z'), // within 24h
        type: 'meeting',
      },
      {
        id: 'future-event',
        title: 'Future Event',
        date: new Date('2023-10-20T12:00:00Z'),
        type: 'meeting',
      }
    ];

    render(<CycleTimeline calendarEvents={events} />);

    // Check titles are rendered
    expect(screen.getByText('Past Event')).toBeInTheDocument();
    expect(screen.getByText('Current Event')).toBeInTheDocument();
    expect(screen.getByText('Future Event')).toBeInTheDocument();

    // Check dates are formatted correctly
    expect(screen.getByText('Oct 10')).toBeInTheDocument();
    expect(screen.getByText('Oct 15')).toBeInTheDocument();
    expect(screen.getByText('Oct 20')).toBeInTheDocument();

    // Check styling for past event
    const pastTitle = screen.getByText('Past Event');
    const pastContainer = pastTitle.closest('div');
    expect(pastContainer).toHaveClass('bg-primary-800/30');
    const pastDot = pastContainer?.previousElementSibling;
    expect(pastDot).toHaveClass('bg-success-500');

    // Check styling for current event
    const currentTitle = screen.getByText('Current Event');
    const currentContainer = currentTitle.closest('div');
    expect(currentContainer).toHaveClass('bg-accent-500/10');
    const currentDot = currentContainer?.previousElementSibling;
    expect(currentDot).toHaveClass('bg-accent-500', 'animate-pulse');

    // Check styling for future event
    const futureTitle = screen.getByText('Future Event');
    const futureContainer = futureTitle.closest('div');
    expect(futureContainer).toHaveClass('bg-primary-800/30');
    const futureDot = futureContainer?.previousElementSibling;
    expect(futureDot).toHaveClass('bg-primary-600');
  });
});
