// import { ChartAreaInteractive } from "@/components/chart-area-interactive"
// import { DataTable } from "@/components/data-table"
// import { SectionCards } from "@/components/section-cards"

// import data from "./data.json"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to the Gas System management dashboard
        </p>
      </div>
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Future dashboard content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Vehicles</h3>
            <p className="mt-2 text-3xl font-bold">-</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Active Drivers</h3>
            <p className="mt-2 text-3xl font-bold">-</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Active Routes</h3>
            <p className="mt-2 text-3xl font-bold">-</p>
          </div>
        </div>
        {/* <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} /> */}
      </div>
    </div>
  )
}
