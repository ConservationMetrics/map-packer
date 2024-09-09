import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Auth0Login from "../../components/Auth0Login.vue";
import { createI18n } from "vue-i18n";

// Create the i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: "en",
  messages: {
    en: {
      loginButton: "Login",
      authMessage: "Please log in",
      yourAccessIsPending: "Access pending",
    },
  },
});

// Mock the LanguagePicker component
vi.mock("../../components/shared/LanguagePicker.vue", () => ({
  default: {
    template: "<div></div>",
  },
}));

describe("Auth0Login", () => {
  it("renders login button", () => {
    const wrapper = mount(Auth0Login, {
      global: {
        plugins: [i18n],
      },
    });
    expect(wrapper.find("button").text()).toBe("Login");
  });

  it("displays error message when provided", () => {
    const wrapper = mount(Auth0Login, {
      global: {
        plugins: [i18n],
      },
      props: {
        errorMessage: "Access pending",
      },
    });
    expect(wrapper.find(".text-red-500").text()).toBe("Access pending");
  });

  it("changes window.location.href to /auth/auth0 on button click", async () => {
    const wrapper = mount(Auth0Login, {
      global: {
        plugins: [i18n],
      },
    });

    // Mock window.location.href
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: "" } as any;

    // Trigger button click
    await wrapper.find("button").trigger("click");

    // Check if window.location.href was updated
    expect(window.location.href).toBe("/auth/auth0");

    // Restore the original window.location
    window.location = originalLocation;
  });
});
