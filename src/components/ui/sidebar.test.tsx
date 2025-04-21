import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Sidebar, SidebarProvider, SidebarMenuAccordion } from "./sidebar";

describe("Sidebar Component", () => {
  it("renders the Sidebar with Accordion", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenuAccordion />
        </Sidebar>
      </SidebarProvider>
    );

    // Check if Accordion items are rendered
    expect(screen.getByText("Menu Item 1")).toBeInTheDocument();
    expect(screen.getByText("Menu Item 2")).toBeInTheDocument();
  });

  it("toggles Accordion items on click", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenuAccordion />
        </Sidebar>
      </SidebarProvider>
    );

    // Click to expand the first Accordion item
    const menuItem1 = screen.getByText("Menu Item 1");
    fireEvent.click(menuItem1);

    // Check if sub-items are visible
    expect(screen.getByText("Sub Item 1")).toBeVisible();
    expect(screen.getByText("Sub Item 2")).toBeVisible();

    // Click again to collapse
    fireEvent.click(menuItem1);
    expect(screen.queryByText("Sub Item 1")).not.toBeVisible();
  });

  it("respects dark mode styling", () => {
    document.body.classList.add("dark");

    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenuAccordion />
        </Sidebar>
      </SidebarProvider>
    );

    // Debugging: Log the rendered Sidebar HTML
    const sidebar = screen.getByRole("complementary");
    console.log(sidebar.outerHTML);

    // Check if dark mode styles are applied
    expect(sidebar).toHaveClass("bg-sidebar");

    document.body.classList.remove("dark");
  });
});