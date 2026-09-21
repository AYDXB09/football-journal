# Privacy Policy

**Last updated: September 21, 2026**

Football Journal is built around **youth players**, and much of the data it holds is about
children. This policy is written to be specific about exactly what's collected and why — not
generic boilerplate — because that specificity matters more here than in most apps.

## 1. Information We Collect

**Account information.** Email, name, and role (Player, Parent, or Coach). Passwords are handled
entirely by Supabase Auth — never seen or stored in plain text by this app.

**Player profile.** Date of birth, dominant foot, primary position, nationality, phone, Instagram
handle, and a short bio, if the player chooses to fill them in.

**Match and training data.** Every match and training session logged — opponent, position(s)
played, minutes, result, mood, numeric performance ratings, and free-text reflections (what went
well, what to improve, a key moment). Goal-by-goal shot and keeper-position data is stored for
matches where it's recorded.

**Diagnostics, goals, and reviews.** Answers to the recurring 6-category self-diagnostic, goals set
(and who set them), season reviews, and summer training plans — including free-text fields like
"letter to self."

**Photos.** Profile avatars, club logos, and milestone/journey photos uploaded to Supabase Storage.

**Teammate information.** If a player adds a teammate (for @mentions in reflections), only that
teammate's **name and nickname** are stored — nothing else. We deliberately do not collect a
teammate's phone, email, or Instagram handle: a teammate has no account here and never consents to
their own contact details being stored by someone else, so that data isn't collected in the first
place. This information is entered by the player or their parent, not the teammate themselves, and
is kept private to the player's own account.

**Parental consent record (Player signup only).** If a Player account is created for someone under
18, we store the parent/guardian's name and email, and the timestamp consent was given, as
submitted on the signup form. See Section 5 for exactly what this does and doesn't establish.

**Parent observations.** If a parent account is linked to a player, the parent's own notes on that
player's matches or training sessions.

**Coach access records.** If a coach is invited, their access level (`limited` or `full`) and
invitation status.

## 2. How We Use Information

- To operate the core features: logging matches/training, tracking goals and diagnostics over
  time, and building the season-by-season Journey view
- To generate AI coaching feedback (see Section 4) after a match, season review, or summer plan is
  saved
- To let a linked Parent or Coach see the data their role is meant to have access to — nothing more
- We do not use this data for advertising, and we do not sell or rent it to anyone

## 3. Who Can See What

Access is role-based, enforced at the database level (row-level security), not just in the app's
UI:

| Role | Can see |
|---|---|
| **Player** | Their own full record |
| **Parent** (linked) | Everything the player sees, except entries the player explicitly marks `player_only` |
| **Coach** (`limited`) | Aggregated stats, diagnostics, and goals only |
| **Coach** (`full`) | Everything except `player_only` entries |

A reflection or goal marked `player_only` is never returned to a parent or coach's queries, at the
database level.

## 4. AI Processing (Google Gemini) — Experimental, On by Default, Toggleable

When you save a match reflection, season review, or summer plan, the structured data (position,
ratings, result) plus your free-text reflection is sent to **Google's Gemini API** to generate
coach-voice feedback. This happens **server-side**, using the app's own API key — not a key you
provide. Only the specific content needed to generate that feedback is sent; it is not used to
train the app's own systems, and Google's own terms govern how Gemini processes that request on
their end.

**This can be turned off.** In Setup → Preferences, a Player can disable AI Coach Feedback. When
off, the Service's own servers reject the request server-side — no reflection content reaches
Gemini while the setting is off. It's on by default, matching how the feature has always worked;
turning it off is an active choice you (or your parent, on your behalf) can make at any time.

**This feature is experimental and may be removed.** Because it depends on a third-party AI
provider outside this Service's control, the operator may discontinue AI processing entirely at
any time — at which point no further reflection content would be sent to Gemini or any other AI
provider, for anyone, regardless of individual toggle settings. AI feedback text already saved on
past entries would not be deleted by this, only future feedback generation would stop.

## 5. Children's Privacy and Parental Consent

This is the most important part of this policy. Football Journal is built for youth players,
including children well under 13. Because of that:

- **Signing up as a Player requires stating whether the player is under 18.** If so, the signup
  form requires a parent or guardian's name and email before the account is created — this is a
  real step in the product, not just a policy statement.
- **Be clear about what this consent step actually establishes.** It's an explicit record of what
  was asserted at signup — a name and email were entered, and a box was checked. It does **not**
  verify that the email address actually belongs to a real parent or guardian; there is no
  confirmation link sent to that address. This is meaningfully better than no consent step at all,
  but it is a self-reported assertion, not a verified identity check.
- We recommend a parent maintain their own linked Parent account for any player under 18, both for
  oversight and so consent for data collection is genuinely informed on an ongoing basis, not a
  one-time checkbox.
- If you are a parent or guardian and want to review, correct, or delete your child's data, you can
  do so directly (Parent accounts have full visibility), or contact the Service operator directly.

## 6. Data Retention and Deletion

Data is retained for as long as the account exists. To request deletion of a player's account and
all associated data (matches, reflections, photos, diagnostics, goals — deletion cascades through
the database), contact the Service operator at **[operator email — to be filled in]**.

## 7. Security

Every table is protected by row-level security scoped to the specific role-based access described
in Section 3. Photos are stored in Supabase Storage; storage URLs are not guessable from
unauthenticated requests.

## 8. Your Choices

- A player can mark any reflection or goal `player_only` to keep it out of parent/coach view.
- A player can turn AI Coach Feedback on or off at any time in Setup → Preferences.
- A parent or player can request a data export or account deletion at any time via the contact
  below.

## 9. Changes to This Policy

If this policy changes in a meaningful way, the "Last updated" date above will reflect that.

## 10. Contact

Questions about this policy, or a request to access, correct, or delete data — especially a child's
data — should go to **[operator email — to be filled in]**.
