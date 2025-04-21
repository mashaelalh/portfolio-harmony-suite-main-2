import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export function useOnboardingTour() {
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: { enabled: true },
      classes: 'shadow-md bg-white rounded-lg',
      scrollTo: { behavior: 'smooth', block: 'center' },
    },
    useModalOverlay: true,
  });

  tour.addStep({
    id: 'welcome',
    text: 'Welcome to the Harmony Suite Dashboard! Let me guide you through the key features.',
    buttons: [
      {
        text: 'Next',
        action: tour.next,
      },
    ],
  });

  tour.addStep({
    id: 'kpis',
    attachTo: { element: '.grid-cols-4', on: 'bottom' },
    text: 'Here are your key performance indicators for portfolios, projects, budget, and risks.',
    buttons: [
      { text: 'Back', action: tour.back },
      { text: 'Next', action: tour.next },
    ],
  });

  tour.addStep({
    id: 'charts',
    attachTo: { element: '[aria-label="Project status and budget charts"]', on: 'top' },
    text: 'Visualize project status and budget allocation with these charts.',
    buttons: [
      { text: 'Back', action: tour.back },
      { text: 'Next', action: tour.next },
    ],
  });

  tour.addStep({
    id: 'portfolios',
    attachTo: { element: '[aria-label="Portfolios overview"]', on: 'top' },
    text: 'Manage your portfolios here.',
    buttons: [
      { text: 'Back', action: tour.back },
      { text: 'Next', action: tour.next },
    ],
  });

  tour.addStep({
    id: 'projects',
    attachTo: { element: '[aria-label="Recent projects overview"]', on: 'top' },
    text: 'Access and manage your projects here.',
    buttons: [
      { text: 'Back', action: tour.back },
      { text: 'Next', action: tour.next },
    ],
  });

  tour.addStep({
    id: 'milestones',
    attachTo: { element: '[aria-label="Upcoming project milestones"]', on: 'top' },
    text: 'Track upcoming milestones across projects.',
    buttons: [
      { text: 'Back', action: tour.back },
      { text: 'Finish', action: tour.complete },
    ],
  });

  return tour;
}