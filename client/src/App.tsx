import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Sidebar from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import AddStudent from "@/pages/add-student";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/students" component={Students} />
        <Route path="/add-student" component={AddStudent} />
        <Route path="/edit-student/:id" component={AddStudent} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
