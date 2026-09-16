"use client";

import { Container } from "@mui/material";
import AppHeader from "@/components/layout/AppHeader";
import TeacherRouteGuard from "@/components/auth/TeacherRouteGuard";
import TeacherClassesSection from "@/components/classes/TeacherClassesSection";
import { useAuth } from "@/components/auth/useAuth";

export default function TeacherClassesPage() {
  const { user } = useAuth();

  return (
    <>
      <AppHeader />

      <TeacherRouteGuard>
        <Container component="main" sx={{ py: { xs: 4, md: 7 } }}>
          {user?.role === "teacher" && (
            <TeacherClassesSection key={`${user.id}:${user.emailVerified}`} />
          )}
        </Container>
      </TeacherRouteGuard>
    </>
  );
}
