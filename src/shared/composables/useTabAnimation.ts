import { ref, watch, readonly, type Ref } from "vue";

const SLIDE = {
  left: "slide-left",
  right: "slide-right",
} as const;

export type SlideType = (typeof SLIDE)[keyof typeof SLIDE];

export type TransitionDirection = "LEFT" | "RIGHT";

export type TransitionConfig = Record<string, TransitionDirection>;

export interface UseTabAnimationOptions {
  /**
   * Transition configuration in the format "fromTab->toTab": "DIRECTION"
   * For example: { "tab1->tab2": "LEFT", "tab2->tab1": "RIGHT" }
   */
  transitionConfig?: TransitionConfig;
  /**
   * Array of tabs in their order for automatic direction determination
   * For example: ["tab1", "tab2", "tab3"] - transitions 1->2->3 will be LEFT, back will be RIGHT
   */
  tabOrder?: string[];
  /**
   * Default direction if the transition is not found in the configuration
   */
  defaultDirection?: TransitionDirection;
  /**
   * Initial animation
   */
  initialAnimation?: SlideType;
}

/**
 * Composable for managing tab transition animations
 *
 * @param activeTab - reactive reference to the active tab
 * @param options - transition configuration options
 * @returns an object with the current animation and a function for manual updates
 */
export function useTabAnimation(
  activeTab: Ref<string>,
  options: UseTabAnimationOptions,
) {
  const {
    transitionConfig,
    tabOrder,
    defaultDirection = "LEFT",
    initialAnimation = SLIDE.right,
  } = options;

  const animation = ref<SlideType>(initialAnimation);

  /**
   * Determines the animation direction based on the tab order
   */
  const getDirectionFromOrder = (
    fromTab: string,
    toTab: string,
  ): TransitionDirection => {
    if (!tabOrder) return defaultDirection;

    const fromIndex = tabOrder.indexOf(fromTab);
    const toIndex = tabOrder.indexOf(toTab);

    if (fromIndex === -1 || toIndex === -1) return defaultDirection;

    return fromIndex < toIndex ? "LEFT" : "RIGHT";
  };

  watch(activeTab, (newTab, oldTab) => {
    if (!oldTab || newTab === oldTab) return;

    let direction: TransitionDirection;

    // First, check the manual configuration
    if (transitionConfig) {
      const key = `${oldTab}->${newTab}`;
      direction =
        transitionConfig[key] ?? getDirectionFromOrder(oldTab, newTab);
    } else {
      // Use automatic determination by order
      direction = getDirectionFromOrder(oldTab, newTab);
    }

    animation.value = direction === "LEFT" ? SLIDE.left : SLIDE.right;
  });

  /**
   * Manual animation update
   * @param direction - animation direction
   */
  const setAnimation = (direction: TransitionDirection) => {
    animation.value = direction === "LEFT" ? SLIDE.left : SLIDE.right;
  };

  /**
   * Set animation directly
   * @param slideType - slide type
   */
  const setSlideAnimation = (slideType: SlideType) => {
    animation.value = slideType;
  };

  return {
    animation: readonly(animation),
    setAnimation,
    setSlideAnimation,
    SLIDE,
  };
}
