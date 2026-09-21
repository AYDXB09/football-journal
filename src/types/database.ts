export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'player' | 'parent' | 'coach' | 'admin'
          avatar_url: string | null
          subscription_tier: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          role: 'player' | 'parent' | 'coach' | 'admin'
          avatar_url?: string | null
          subscription_tier?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'player' | 'parent' | 'coach' | 'admin'
          avatar_url?: string | null
          subscription_tier?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      player_profiles: {
        Row: {
          id: string
          user_id: string
          date_of_birth: string | null
          dominant_foot: 'right' | 'left' | 'both' | null
          primary_position: string | null
          nationality: string | null
          avatar_url: string | null
          phone: string | null
          instagram_handle: string | null
          bio: string | null
          ai_coach_enabled: boolean
          is_minor: boolean | null
          guardian_name: string | null
          guardian_email: string | null
          consent_given_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date_of_birth?: string | null
          dominant_foot?: 'right' | 'left' | 'both' | null
          primary_position?: string | null
          nationality?: string | null
          avatar_url?: string | null
          phone?: string | null
          instagram_handle?: string | null
          bio?: string | null
          ai_coach_enabled?: boolean
          is_minor?: boolean | null
          guardian_name?: string | null
          guardian_email?: string | null
          consent_given_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date_of_birth?: string | null
          dominant_foot?: 'right' | 'left' | 'both' | null
          primary_position?: string | null
          nationality?: string | null
          avatar_url?: string | null
          phone?: string | null
          instagram_handle?: string | null
          bio?: string | null
          ai_coach_enabled?: boolean
          is_minor?: boolean | null
          guardian_name?: string | null
          guardian_email?: string | null
          consent_given_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'player_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      seasons: {
        Row: {
          id: string
          player_id: string
          label: string
          start_date: string | null
          end_date: string | null
          notes: string | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          label: string
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          label?: string
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'seasons_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      clubs: {
        Row: {
          id: string
          player_id: string
          name: string
          logo_url: string | null
          website: string | null
          contact_email: string | null
          contact_phone: string | null
          has_professional_pathway: boolean | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          name: string
          logo_url?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          has_professional_pathway?: boolean | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          name?: string
          logo_url?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          has_professional_pathway?: boolean | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'clubs_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      teams: {
        Row: {
          id: string
          club_id: string
          season_id: string
          player_id: string
          age_group: string
          team_label: string
          kit_primary_colour: string | null
          kit_secondary_colour: string | null
          training_hours_per_week: number | null
          league_level: string | null
          format: '5v5' | '7v7' | '9v9' | '11v11' | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          club_id: string
          season_id: string
          player_id: string
          age_group: string
          team_label: string
          kit_primary_colour?: string | null
          kit_secondary_colour?: string | null
          training_hours_per_week?: number | null
          league_level?: string | null
          format?: '5v5' | '7v7' | '9v9' | '11v11' | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          season_id?: string
          player_id?: string
          age_group?: string
          team_label?: string
          kit_primary_colour?: string | null
          kit_secondary_colour?: string | null
          training_hours_per_week?: number | null
          league_level?: string | null
          format?: '5v5' | '7v7' | '9v9' | '11v11' | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'teams_club_id_fkey'
            columns: ['club_id']
            isOneToOne: false
            referencedRelation: 'clubs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'teams_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'teams_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
        ]
      }
      teammates: {
        Row: {
          id: string
          player_id: string
          team_id: string
          season_id: string
          name: string
          nickname: string | null
          positions: string[] | null
          kit_number: number | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          team_id: string
          season_id: string
          name: string
          nickname?: string | null
          positions?: string[] | null
          kit_number?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          team_id?: string
          season_id?: string
          name?: string
          nickname?: string | null
          positions?: string[] | null
          kit_number?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'teammates_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'teammates_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'teammates_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      competitions: {
        Row: {
          id: string
          team_id: string
          season_id: string
          player_id: string
          name: string
          type: 'league' | 'cup' | 'friendly' | 'trial' | 'tournament' | null
          league_level: string | null
          default_match_minutes: number | null
          website: string | null
          start_date: string | null
          end_date: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          season_id: string
          player_id: string
          name: string
          type?: 'league' | 'cup' | 'friendly' | 'trial' | 'tournament' | null
          league_level?: string | null
          default_match_minutes?: number | null
          website?: string | null
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          season_id?: string
          player_id?: string
          name?: string
          type?: 'league' | 'cup' | 'friendly' | 'trial' | 'tournament' | null
          league_level?: string | null
          default_match_minutes?: number | null
          website?: string | null
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'competitions_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'competitions_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'competitions_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      matches: {
        Row: {
          id: string
          player_id: string
          season_id: string
          team_id: string
          competition_id: string | null
          date: string
          opponent: string
          venue_type: 'home' | 'away' | 'neutral' | null
          stage: 'pool' | 'knockout' | 'final' | 'group' | 'friendly' | 'other' | null
          total_match_minutes: number | null
          minutes_played: number | null
          goals_for: number | null
          goals_against: number | null
          result: 'W' | 'D' | 'L' | null
          mood: 'brilliant' | 'good' | 'ok' | 'tough' | 'frustrated' | null
          overall_rating: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          team_id: string
          competition_id?: string | null
          date: string
          opponent: string
          venue_type?: 'home' | 'away' | 'neutral' | null
          stage?: 'pool' | 'knockout' | 'final' | 'group' | 'friendly' | 'other' | null
          total_match_minutes?: number | null
          minutes_played?: number | null
          goals_for?: number | null
          goals_against?: number | null
          result?: 'W' | 'D' | 'L' | null
          mood?: 'brilliant' | 'good' | 'ok' | 'tough' | 'frustrated' | null
          overall_rating?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          season_id?: string
          team_id?: string
          competition_id?: string | null
          date?: string
          opponent?: string
          venue_type?: 'home' | 'away' | 'neutral' | null
          stage?: 'pool' | 'knockout' | 'final' | 'group' | 'friendly' | 'other' | null
          total_match_minutes?: number | null
          minutes_played?: number | null
          goals_for?: number | null
          goals_against?: number | null
          result?: 'W' | 'D' | 'L' | null
          mood?: 'brilliant' | 'good' | 'ok' | 'tough' | 'frustrated' | null
          overall_rating?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'matches_competition_id_fkey'
            columns: ['competition_id']
            isOneToOne: false
            referencedRelation: 'competitions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      match_positions: {
        Row: {
          id: string
          match_id: string
          position: string
          minutes_from: number | null
          minutes_to: number | null
        }
        Insert: {
          id?: string
          match_id: string
          position: string
          minutes_from?: number | null
          minutes_to?: number | null
        }
        Update: {
          id?: string
          match_id?: string
          position?: string
          minutes_from?: number | null
          minutes_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'match_positions_match_id_fkey'
            columns: ['match_id']
            isOneToOne: false
            referencedRelation: 'matches'
            referencedColumns: ['id']
          },
        ]
      }
      match_ratings: {
        Row: {
          id: string
          match_id: string
          dimension: string
          score: number | null
        }
        Insert: {
          id?: string
          match_id: string
          dimension: string
          score?: number | null
        }
        Update: {
          id?: string
          match_id?: string
          dimension?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'match_ratings_match_id_fkey'
            columns: ['match_id']
            isOneToOne: false
            referencedRelation: 'matches'
            referencedColumns: ['id']
          },
        ]
      }
      match_video_moments: {
        Row: {
          id: string
          match_id: string
          url: string
          timestamp_in_video: string | null
          label: string | null
          notes: string | null
          moment_type: 'highlight' | 'learning' | 'error' | 'goal' | 'assist' | null
          created_at: string | null
        }
        Insert: {
          id?: string
          match_id: string
          url: string
          timestamp_in_video?: string | null
          label?: string | null
          notes?: string | null
          moment_type?: 'highlight' | 'learning' | 'error' | 'goal' | 'assist' | null
          created_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string
          url?: string
          timestamp_in_video?: string | null
          label?: string | null
          notes?: string | null
          moment_type?: 'highlight' | 'learning' | 'error' | 'goal' | 'assist' | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'match_video_moments_match_id_fkey'
            columns: ['match_id']
            isOneToOne: false
            referencedRelation: 'matches'
            referencedColumns: ['id']
          },
        ]
      }
      match_contributions: {
        Row: {
          id: string
          match_id: string
          player_id: string
          goal_index: number
          goal_type: 'regular' | 'penalty' | 'freekick' | null
          ball_x: number | null
          ball_y: number | null
          ball_zone: string | null
          keeper_x_pct: number | null
          keeper_posture: 'standing' | 'jumping' | 'sliding' | null
          body_part: string | null
          technique: string | null
          score_us: number | null
          score_opp: number | null
          period: string | null
          shot_x: number | null
          shot_y: number | null
          shot_zone: string | null
          video_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          match_id: string
          player_id: string
          goal_index?: number
          goal_type?: 'regular' | 'penalty' | 'freekick' | null
          ball_x?: number | null
          ball_y?: number | null
          ball_zone?: string | null
          keeper_x_pct?: number | null
          keeper_posture?: 'standing' | 'jumping' | 'sliding' | null
          body_part?: string | null
          technique?: string | null
          score_us?: number | null
          score_opp?: number | null
          period?: string | null
          shot_x?: number | null
          shot_y?: number | null
          shot_zone?: string | null
          video_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string
          player_id?: string
          goal_index?: number
          goal_type?: 'regular' | 'penalty' | 'freekick' | null
          ball_x?: number | null
          ball_y?: number | null
          ball_zone?: string | null
          keeper_x_pct?: number | null
          keeper_posture?: 'standing' | 'jumping' | 'sliding' | null
          body_part?: string | null
          technique?: string | null
          score_us?: number | null
          score_opp?: number | null
          period?: string | null
          shot_x?: number | null
          shot_y?: number | null
          shot_zone?: string | null
          video_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'match_contributions_match_id_fkey'
            columns: ['match_id']
            isOneToOne: false
            referencedRelation: 'matches'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'match_contributions_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      training_sessions: {
        Row: {
          id: string
          player_id: string
          season_id: string
          team_id: string | null
          date: string
          duration_minutes: number | null
          session_type: 'technical' | 'tactical' | 'physical' | 'set_pieces' | 'small_sided' | 'fitness' | 'other' | null
          focus_areas: string[] | null
          coach_led: boolean | null
          notes: string | null
          rating: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          team_id?: string | null
          date: string
          duration_minutes?: number | null
          session_type?: 'technical' | 'tactical' | 'physical' | 'set_pieces' | 'small_sided' | 'fitness' | 'other' | null
          focus_areas?: string[] | null
          coach_led?: boolean | null
          notes?: string | null
          rating?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          season_id?: string
          team_id?: string | null
          date?: string
          duration_minutes?: number | null
          session_type?: 'technical' | 'tactical' | 'physical' | 'set_pieces' | 'small_sided' | 'fitness' | 'other' | null
          focus_areas?: string[] | null
          coach_led?: boolean | null
          notes?: string | null
          rating?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'training_sessions_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'training_sessions_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'training_sessions_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      reflections: {
        Row: {
          id: string
          player_id: string
          entity_type: 'match' | 'training' | 'standalone' | null
          entity_id: string | null
          author_role: 'player' | 'parent' | 'coach' | null
          went_well: string | null
          improve_next: string | null
          key_moment: string | null
          coach_feedback_received: string | null
          free_text: string | null
          visibility: 'player_only' | 'family' | 'coach' | 'public' | null
          ai_feedback: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          entity_type?: 'match' | 'training' | 'standalone' | null
          entity_id?: string | null
          author_role?: 'player' | 'parent' | 'coach' | null
          went_well?: string | null
          improve_next?: string | null
          key_moment?: string | null
          coach_feedback_received?: string | null
          free_text?: string | null
          visibility?: 'player_only' | 'family' | 'coach' | 'public' | null
          ai_feedback?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          entity_type?: 'match' | 'training' | 'standalone' | null
          entity_id?: string | null
          author_role?: 'player' | 'parent' | 'coach' | null
          went_well?: string | null
          improve_next?: string | null
          key_moment?: string | null
          coach_feedback_received?: string | null
          free_text?: string | null
          visibility?: 'player_only' | 'family' | 'coach' | 'public' | null
          ai_feedback?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'reflections_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      reflection_mentions: {
        Row: {
          id: string
          reflection_id: string
          teammate_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          reflection_id: string
          teammate_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          reflection_id?: string
          teammate_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'reflection_mentions_reflection_id_fkey'
            columns: ['reflection_id']
            isOneToOne: false
            referencedRelation: 'reflections'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reflection_mentions_teammate_id_fkey'
            columns: ['teammate_id']
            isOneToOne: false
            referencedRelation: 'teammates'
            referencedColumns: ['id']
          },
        ]
      }
      diagnostics: {
        Row: {
          id: string
          player_id: string
          season_id: string
          date: string
          scores: Json
          ai_summary: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          date: string
          scores: Json
          ai_summary?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          season_id?: string
          date?: string
          scores?: Json
          ai_summary?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'diagnostics_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'diagnostics_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
        ]
      }
      goals: {
        Row: {
          id: string
          player_id: string
          season_id: string
          team_id: string | null
          text: string
          why: string | null
          pillar: string | null
          set_by: 'player' | 'parent' | 'coach' | null
          target_date: string | null
          completed_at: string | null
          completion_reflection: string | null
          visibility: 'player_only' | 'family' | 'coach' | 'public' | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          team_id?: string | null
          text: string
          why?: string | null
          pillar?: string | null
          set_by?: 'player' | 'parent' | 'coach' | null
          target_date?: string | null
          completed_at?: string | null
          completion_reflection?: string | null
          visibility?: 'player_only' | 'family' | 'coach' | 'public' | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          season_id?: string
          team_id?: string | null
          text?: string
          why?: string | null
          pillar?: string | null
          set_by?: 'player' | 'parent' | 'coach' | null
          target_date?: string | null
          completed_at?: string | null
          completion_reflection?: string | null
          visibility?: 'player_only' | 'family' | 'coach' | 'public' | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'goals_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'goals_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'goals_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      season_reviews: {
        Row: {
          id: string
          player_id: string
          season_id: string
          team_reflections: Json | null
          proud: string | null
          hardest_moment: string | null
          new_skill: string | null
          gap: string | null
          coach_theme: string | null
          letter_to_self: string | null
          ratings: Json | null
          ai_feedback: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          team_reflections?: Json | null
          proud?: string | null
          hardest_moment?: string | null
          new_skill?: string | null
          gap?: string | null
          coach_theme?: string | null
          letter_to_self?: string | null
          ratings?: Json | null
          ai_feedback?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          season_id?: string
          team_reflections?: Json | null
          proud?: string | null
          hardest_moment?: string | null
          new_skill?: string | null
          gap?: string | null
          coach_theme?: string | null
          letter_to_self?: string | null
          ratings?: Json | null
          ai_feedback?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'season_reviews_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'season_reviews_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
        ]
      }
      summer_plans: {
        Row: {
          id: string
          player_id: string
          season_id: string
          technical_skills: Json | null
          physical_skills: Json | null
          watch_skills: Json | null
          min_sessions_per_week: number | null
          session_length_minutes: number | null
          big_goal: string | null
          accountability_partner: string | null
          september_self_image: string | null
          ai_feedback: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          technical_skills?: Json | null
          physical_skills?: Json | null
          watch_skills?: Json | null
          min_sessions_per_week?: number | null
          session_length_minutes?: number | null
          big_goal?: string | null
          accountability_partner?: string | null
          september_self_image?: string | null
          ai_feedback?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          season_id?: string
          technical_skills?: Json | null
          physical_skills?: Json | null
          watch_skills?: Json | null
          min_sessions_per_week?: number | null
          session_length_minutes?: number | null
          big_goal?: string | null
          accountability_partner?: string | null
          september_self_image?: string | null
          ai_feedback?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'summer_plans_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'summer_plans_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
        ]
      }
      player_photos: {
        Row: {
          id: string
          player_id: string
          url: string
          caption: string | null
          date_taken: string | null
          season_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          url: string
          caption?: string | null
          date_taken?: string | null
          season_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          url?: string
          caption?: string | null
          date_taken?: string | null
          season_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'player_photos_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'player_photos_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
        ]
      }
      parent_observations: {
        Row: {
          id: string
          player_id: string
          parent_user_id: string
          entity_type: 'match' | 'training' | null
          entity_id: string | null
          observation: string
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          parent_user_id: string
          entity_type?: 'match' | 'training' | null
          entity_id?: string | null
          observation: string
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          parent_user_id?: string
          entity_type?: 'match' | 'training' | null
          entity_id?: string | null
          observation?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'parent_observations_parent_user_id_fkey'
            columns: ['parent_user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'parent_observations_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      coach_access: {
        Row: {
          id: string
          player_id: string
          coach_user_id: string
          access_level: 'limited' | 'full' | null
          invited_at: string | null
          accepted_at: string | null
          revoked_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          coach_user_id: string
          access_level?: 'limited' | 'full' | null
          invited_at?: string | null
          accepted_at?: string | null
          revoked_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          coach_user_id?: string
          access_level?: 'limited' | 'full' | null
          accepted_at?: string | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'coach_access_coach_user_id_fkey'
            columns: ['coach_user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'coach_access_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      parent_links: {
        Row: {
          id: string
          player_id: string
          parent_user_id: string
          linked_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          parent_user_id: string
          linked_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          parent_user_id?: string
          linked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'parent_links_parent_user_id_fkey'
            columns: ['parent_user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'parent_links_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      is_coach_of: { Args: { player: string }; Returns: boolean }
      is_full_coach_of: { Args: { player: string }; Returns: boolean }
      is_parent_of: { Args: { player: string }; Returns: boolean }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
