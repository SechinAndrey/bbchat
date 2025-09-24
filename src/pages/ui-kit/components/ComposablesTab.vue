<script setup lang="ts">
import { useToast } from "@src/shared/composables/useToast";
import Button from "@src/ui/inputs/Button.vue";

const { toastSuccess, toastError, toastWarning, toastInfo, toast } = useToast();

const showSuccessExample = () => {
  toastSuccess("Operation completed successfully!");
};

const showErrorExample = () => {
  toastError("An error occurred while performing the operation");
};

const showWarningExample = () => {
  toastWarning("Warning! Please check the entered data");
};

const showInfoExample = () => {
  toastInfo("Informational message");
};

const showCustomExample = () => {
  toast("Custom message", "success", {
    autoClose: 5000,
    position: "top-center",
  });
};

const showQuickExample = () => {
  toastSuccess("Quick message", { autoClose: 1000 });
};
</script>

<template>
  <div class="space-y-8">
    <!-- useToast Composable -->
    <section>
      <h2 class="text-2xl font-bold mb-4 text-app-text">useToast Composable</h2>
      <p class="text-app-text-secondary mb-6">
        Composable for simplifying work with toast notifications. Automatically
        applies theme and standard settings.
      </p>

      <!-- Basic Usage -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-app-text">Basic Usage</h3>
        <div class="bg-app-bg-secondary p-4 rounded-lg mb-4">
          <pre
            class="text-sm text-app-text"
          ><code>import { useToast } from "@src/shared/composables/useToast";

const { toastSuccess, toastError, toastWarning, toastInfo } = useToast();

// Simple usage
toastSuccess("Operation completed successfully!");
toastError("An error occurred");
toastWarning("Warning! Check the data");
toastInfo("Informational message");</code></pre>
        </div>

        <div class="flex flex-wrap gap-3">
          <Button variant="primary" color="success" @click="showSuccessExample">
            Success Toast
          </Button>
          <Button variant="primary" color="danger" @click="showErrorExample">
            Error Toast
          </Button>
          <Button variant="primary" color="warning" @click="showWarningExample">
            Warning Toast
          </Button>
          <Button variant="primary" color="primary" @click="showInfoExample">
            Info Toast
          </Button>
        </div>
      </div>

      <!-- Advanced Usage -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-app-text">Advanced Usage</h3>
        <div class="bg-app-bg-secondary p-4 rounded-lg mb-4">
          <pre class="text-sm text-app-text"><code>// With custom options
toastSuccess("Message", {
  autoClose: 5000,
  position: "top-center"
});

// Universal method
toast("Custom message", "success", {
  autoClose: 5000,
  position: "top-center"
});</code></pre>
        </div>

        <div class="flex flex-wrap gap-3">
          <Button variant="outline" @click="showCustomExample">
            Custom Toast (5s, top-center)
          </Button>
          <Button variant="outline" @click="showQuickExample">
            Quick Toast (1s)
          </Button>
        </div>
      </div>

      <!-- API Reference -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-app-text">API Reference</h3>

        <div class="bg-app-bg-secondary p-4 rounded-lg mb-4">
          <h4 class="font-medium mb-2 text-app-text">Methods:</h4>
          <ul class="text-sm text-app-text-secondary space-y-1">
            <li>
              <code>toastSuccess(message, options?)</code> - Show success toast
            </li>
            <li>
              <code>toastError(message, options?)</code> - Show error toast
            </li>
            <li>
              <code>toastWarning(message, options?)</code> - Show warning toast
            </li>
            <li><code>toastInfo(message, options?)</code> - Show info toast</li>
            <li>
              <code>toast(message, type, options?)</code> - Universal method
            </li>
          </ul>
        </div>

        <div class="bg-app-bg-secondary p-4 rounded-lg mb-4">
          <h4 class="font-medium mb-2 text-app-text">
            Options (UseToastOptions):
          </h4>
          <ul class="text-sm text-app-text-secondary space-y-1">
            <li>
              <code>autoClose?: number</code> - Auto-close time in ms (default:
              3000)
            </li>
            <li>
              <code>position?: string</code> - Toast position (default:
              "bottom-right")
            </li>
          </ul>
        </div>

        <div class="bg-app-bg-secondary p-4 rounded-lg">
          <h4 class="font-medium mb-2 text-app-text">Available positions:</h4>
          <ul class="text-sm text-app-text-secondary space-y-1">
            <li>
              <code>"top-left"</code>, <code>"top-center"</code>,
              <code>"top-right"</code>
            </li>
            <li>
              <code>"bottom-left"</code>, <code>"bottom-center"</code>,
              <code>"bottom-right"</code>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
