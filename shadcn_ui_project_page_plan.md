
# 🎨 UI Enhancement Plan for Project Page (Using shadcn/ui)

This plan outlines enhancements to modernize and improve the user interface of the **Project Page** using [shadcn/ui](https://ui.shadcn.com/blocks) components.

---

## ✅ General UI Improvements

| Section                  | Improvement                                                                 | Suggested `shadcn` Component           |
|--------------------------|-----------------------------------------------------------------------------|----------------------------------------|
| **Header**               | Add sticky header with breadcrumbs and project icon                         | `PageHeader`, `Breadcrumb`, `Avatar`   |
| **Project Info Cards**   | Replace plain boxes with visual cards and badges                            | `Card`, `Badge`, `Label`               |
| **Description**          | Use rich textarea or collapsible markdown notes                             | `Textarea`, `Accordion`, `Tooltip`     |
| **Tabs Section**         | Modern tabs with icons and animated transitions                             | `Tabs`, `Icon`, `Card`                 |
| **Timeline Error**       | Use styled alert with retry action and tooltip                              | `Alert`, `Button`, `Tooltip`           |
| **Strategic Alignment**  | Grid card with radial progress and KPI indicators                           | `Card`, `Progress`, `Badge`, `Separator` |
| **Stage Gate Progress**  | Visual stepper or vertical timeline for project stages                      | `Stepper`, `Icon`, `Accordion`         |

---

## ✨ UI Component Layout (Markdown with Code Examples)

### 🔷 Top Header
```tsx
<PageHeader>
  <Breadcrumb>
    <BreadcrumbItem>Projects</BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>Infrastructure</BreadcrumbItem>
  </Breadcrumb>
  <div className="flex items-center gap-4">
    <Avatar />
    <span className="text-xl font-semibold">Infrastructure</span>
    <Badge variant="outline">Project ID: 3.2</Badge>
  </div>
</PageHeader>
```

---

### 🟩 Project Info Summary
```tsx
<div className="grid grid-cols-2 gap-4">
  <Card>
    <Label>Project Phase</Label>
    <Badge variant="secondary">Pre-initiation</Badge>
  </Card>
  <Card>
    <Label>Project Status</Label>
    <Badge variant="destructive">In Progress</Badge>
  </Card>
</div>
```

---

### 🧾 Description
```tsx
<Card>
  <Label>Description</Label>
  <Textarea defaultValue="Scope of the project is as follows..." />
</Card>
```

---

### 🗂 Tabs (Gantt, Milestones, etc.)
```tsx
<Tabs defaultValue="gantt">
  <TabsList>
    <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
    <TabsTrigger value="milestones">Milestones</TabsTrigger>
    <TabsTrigger value="risks">Risks</TabsTrigger>
    <TabsTrigger value="budget">Budget</TabsTrigger>
  </TabsList>
  <TabsContent value="gantt">
    <Alert variant="destructive">Error loading timeline</Alert>
  </TabsContent>
</Tabs>
```

---

### 🎯 Strategic Alignment
```tsx
<Card className="bg-gradient-to-r from-sky-100 to-white">
  <div className="flex justify-between">
    <div>
      <h4>Strategic Alignment</h4>
      <p className="text-sm text-muted-foreground">100% Aligned</p>
      <Separator className="my-2" />
      <p><b>Context:</b> Infrastructure</p>
      <p><b>Objective:</b> Operational Excellence</p>
    </div>
    <Progress value={100} className="w-24" />
  </div>
</Card>
```

---

### 🧭 Stage Gate Progress
```tsx
<Stepper orientation="vertical" activeStep={0}>
  <Step title="G0: Project Initiation" />
  <Step title="G1: Concept Development" />
  <Step title="G2: Detailed Planning" />
  <Step title="G3: Implementation" />
  <Step title="G4: Project Closure" />
</Stepper>
```

---

## 💡 Additional Enhancements

| Feature            | Suggestion                                                         |
|--------------------|--------------------------------------------------------------------|
| **Dark Mode**      | Add `dark:` class support for all components                       |
| **Responsiveness** | Use responsive grids like `grid-cols-1 sm:grid-cols-2`             |
| **Animations**     | Integrate `framer-motion` for subtle transitions                   |
| **User Avatar**    | Display role and user avatar via `CardHeader` with metadata badge  |

---
