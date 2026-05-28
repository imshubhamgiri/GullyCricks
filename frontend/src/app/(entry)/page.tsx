"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import { useFormState } from "@/hooks";
import {
  CreateMatchForm,
  JoinMatchForm,
  EntryCard,
  EntryHeader,
} from "@/components/entry";

/**
 * HOME PAGE: /
 * 
 * Two options:
 * 1. Create Match - Admin creates a new match
 * 2. Join Match - Viewer joins existing match with code
 */

export default function Home() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  // UI State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Form States using custom hook
  const createFormState = useFormState({
    adminName: "",
    overs: 5,
    players: 4,
    wideRuns: 1,
    noBallRuns: 1,
  });

  const joinFormState = useFormState({
    matchCode: "",
    playerName: "",
  });

  // Helper function to create/get visitor ID
  const createVisitorId = () => {
    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) {
      visitorId = window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("visitorId", visitorId);
    }
    return visitorId;
  };

  /**
   * Handle Create Match
   */
  const handleCreateMatch = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    createFormState.clearError();
    const visitorId = createVisitorId();

    if (!createFormState.formData.adminName) {
      createFormState.setFieldError("Please enter your name");
      return;
    }

    if (!isConnected) {
      createFormState.setFieldError("Not connected to server. Please refresh the page.");
      return;
    }

    createFormState.setLoading(true);

    const payload = {
      visitorId,
      displayName: (createFormState.formData.adminName as string).trim(),
      settings: {
        overs: createFormState.formData.overs,
        players: createFormState.formData.players,
        wideRuns: createFormState.formData.wideRuns,
        noBallRuns: createFormState.formData.noBallRuns,
      },
    };

    socket?.emit("createMatch", payload, (response: any) => {
      createFormState.setLoading(false);

      if (response.success) {
        const matchData = {
          matchCode: response.matchCode,
          createdBy: createFormState.formData.adminName,
          users: [
            {
              visitorId,
              displayName: createFormState.formData.adminName,
              role: "admin",
            },
          ],
          isAdmin: true,
          settings: {
            overs: createFormState.formData.overs,
            players: createFormState.formData.players,
            wideRuns: createFormState.formData.wideRuns,
            noBallRuns: createFormState.formData.noBallRuns,
          },
          score: response.score,
          ballHistory: [],
          currentOverBalls: [],
        };
        sessionStorage.setItem(
          `match-${response.matchId}`,
          JSON.stringify(matchData)
        );
        router.push(`/match/${response.matchId}`);
      } else {
        createFormState.setFieldError(
          response.error || "Failed to create match"
        );
      }
    });
  };

  /**
   * Handle Join Match
   */
  const handleJoinMatch = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    joinFormState.clearError();
    const visitorId = createVisitorId();

    if (
      !joinFormState.formData.matchCode ||
      !joinFormState.formData.playerName
    ) {
      joinFormState.setFieldError("Please enter match code and your name");
      return;
    }

    if (!isConnected) {
      joinFormState.setFieldError(
        "Not connected to server. Please refresh the page."
      );
      return;
    }

    joinFormState.setLoading(true);

    socket?.emit(
      "joinMatch",
      {
        visitorId: createVisitorId(),
        matchCode: (joinFormState.formData.matchCode as string)
          .trim()
          .toUpperCase(),
        playerName: (joinFormState.formData.playerName as string).trim(),
      },
      (response: any) => {
        joinFormState.setLoading(false);

        if (response.success) {
          const matchData = {
            visitorId,
            matchCode: response.match.matchCode,
            createdBy: response.match.createdBy,
            users: response.match.users,
            isAdmin: false,
            settings: response.match.settings,
            score: response.match.score,
            ballHistory: response.match.ballHistory || [],
            currentOverBalls: response.match.currentOverBalls || [],
          };
          sessionStorage.setItem(
            `match-${response.matchId}`,
            JSON.stringify(matchData)
          );
          router.push(`/match/${response.matchId}`);
        } else {
          joinFormState.setFieldError(
            response.error || "Failed to join match"
          );
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <EntryHeader isConnected={isConnected} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* CREATE MATCH CARD */}
          <EntryCard
            title="Create Match"
            emoji="🏏"
            description="Set up a new match and invite others"
            isFormVisible={showCreateForm}
            isConnected={isConnected}
            onShowForm={() => {
              setShowCreateForm(true);
              createFormState.clearError();
            }}
          >
            <CreateMatchForm
              adminName={createFormState.formData.adminName as string}
              overs={createFormState.formData.overs as number}
              players={createFormState.formData.players as number}
              wideRuns={createFormState.formData.wideRuns as number}
              noBallRuns={createFormState.formData.noBallRuns as number}
              loading={createFormState.loading}
              error={createFormState.error}
              onAdminNameChange={(value) =>
                createFormState.handleChange("adminName", value)
              }
              onOversChange={(value) =>
                createFormState.handleChange("overs", value)
              }
              onPlayersChange={(value) =>
                createFormState.handleChange("players", value)
              }
              onWideRunsChange={(value) =>
                createFormState.handleChange("wideRuns", value)
              }
              onNoBallRunsChange={(value) =>
                createFormState.handleChange("noBallRuns", value)
              }
              onSubmit={handleCreateMatch}
              onCancel={() => {
                setShowCreateForm(false);
                createFormState.clearError();
              }}
            />
          </EntryCard>

          {/* JOIN MATCH CARD */}
          <EntryCard
            title="Join Match"
            emoji="🎯"
            description="Enter a match code to view live updates"
            isFormVisible={showJoinForm}
            isConnected={isConnected}
            onShowForm={() => {
              setShowJoinForm(true);
              joinFormState.clearError();
            }}
          >
            <JoinMatchForm
              matchCode={joinFormState.formData.matchCode as string}
              playerName={joinFormState.formData.playerName as string}
              loading={joinFormState.loading}
              error={joinFormState.error}
              onMatchCodeChange={(value) =>
                joinFormState.handleChange("matchCode", value)
              }
              onPlayerNameChange={(value) =>
                joinFormState.handleChange("playerName", value)
              }
              onSubmit={handleJoinMatch}
              onCancel={() => {
                setShowJoinForm(false);
                joinFormState.clearError();
              }}
            />
          </EntryCard>
        </div>
      </div>
    </div>
  );
}
