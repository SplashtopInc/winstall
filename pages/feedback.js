import { useRef, useState } from "react";
import { useSession } from "next-auth/react";

import Footer from "../components/Footer";
import MetaTags from "../components/MetaTags";
import Toast from "../components/Toast";
import {
  FEEDBACK_MESSAGE_MAX_LENGTH,
  normalizeFeedbackMessage,
  prepareFeedback,
  submitFeedback,
} from "../utils/feedbackApi";
import { getDocumentShellStaticProps } from "../utils/documentShellStaticProps";
import styles from "../styles/feedback.module.scss";

const CATEGORIES = [
  {
    value: "bug",
    label: "Bug report",
    hint: "Report an issue",
    placeholder: "Describe the issue...",
  },
  {
    value: "suggestion",
    label: "Suggestion",
    hint: "Share an idea",
    placeholder: "Share your idea...",
  },
  {
    value: "other",
    label: "Other",
    hint: "Anything else",
    placeholder: "Anything else...",
  },
];

const NOT_SENT = "Something went wrong. Please try again.";
const SUCCESS = "Thanks for helping us improve Winstall!";

const FIELD_ERRORS = {
  category: "Choose Bug report, Suggestion, or Other.",
  empty: "Write a note before sending.",
  length: "The note must be 2000 characters or fewer.",
};

function KindIcon({ kind }) {
  if (kind === "suggestion") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.2 11.1c.5.4 1.2 1.1 1.2 2h4c0-.9.7-1.6 1.2-2A6 6 0 0 0 12 3Z" />
      </svg>
    );
  }

  if (kind === "other") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 18.5 4.8 21v-3.2A7.2 7.2 0 1 1 12 19.2H8Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 8 7.2 5.2M15 8l1.8-2.8" />
      <path d="M9.2 9.2a2.8 2.8 0 0 1 5.6 0" />
      <path d="M8 12.2c0-1 .9-1.8 4-1.8s4 .8 4 1.8V16a4 4 0 0 1-8 0v-3.8Z" />
      <path d="M8 14H5.2M16 14h2.8M8.2 17H5.6M15.8 17h2.6" />
    </svg>
  );
}

export default function Feedback() {
  const { status: sessionStatus } = useSession();
  const sendingRef = useRef(false);
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const sessionReady = sessionStatus !== "loading";
  const length = normalizeFeedbackMessage(message).length;
  const selected = CATEGORIES.find((item) => item.value === category) || CATEGORIES[0];
  const sendDisabled = !sessionReady || submitting || length === 0;

  const handleMessage = (event) => {
    setMessage(event.target.value.slice(0, FEEDBACK_MESSAGE_MAX_LENGTH));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!sessionReady || sendingRef.current) return;

    const draft = prepareFeedback({ category, message });
    if (!draft.ok) {
      setToast({ type: "error", message: FIELD_ERRORS[draft.reason] });
      return;
    }

    sendingRef.current = true;
    setSubmitting(true);
    setToast(null);

    const { response, error: requestError, status: httpStatus } = await submitFeedback({
      category,
      message,
    });

    sendingRef.current = false;
    setSubmitting(false);

    if (httpStatus === 201 && response) {
      setMessage("");
      setCategory("bug");
      setToast({ type: "success", message: SUCCESS });
      return;
    }

    if (httpStatus === 400 || httpStatus === 429) {
      setToast({ type: "error", message: requestError || NOT_SENT });
      return;
    }

    setToast({ type: "error", message: NOT_SENT });
  };

  return (
    <div className={styles.page}>
      <MetaTags
        title="Feedback | winstall"
        path="/feedback"
        desc="Help us make Winstall better. Send a bug, suggestion, or anything else. We read every message. There is no reply on this page."
      />

      <div className={styles.column}>
        <h1>Share your feedback</h1>
        <p className={styles.lead}>
          Help us make Winstall better. We read every message and use your feedback to improve the experience.
        </p>
        <hr className={styles.rule} />

        <form onSubmit={handleSubmit} noValidate>
          <p className={styles.ask}>What would you like to tell us?</p>
          <div className={styles.kinds} role="radiogroup" aria-label="Type">
            {CATEGORIES.map((item) => {
              const on = category === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={on ? styles.kindOn : styles.kind}
                  onClick={() => setCategory(item.value)}
                >
                  <span className={styles.kindIcon}>
                    <KindIcon kind={item.value} />
                  </span>
                  <span className={styles.kindCopy}>
                    <span className={styles.kindName}>{item.label}</span>
                    <span className={styles.kindHint}>{item.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className={styles.fieldLabel} id="feedback-note-label">
            Tell us more
          </p>
          <div className={styles.field}>
            <textarea
              id="feedback-message"
              className={styles.note}
              aria-labelledby="feedback-note-label"
              placeholder={selected.placeholder}
              value={message}
              maxLength={FEEDBACK_MESSAGE_MAX_LENGTH}
              onChange={handleMessage}
            />
            <p className={styles.meter}>
              {length} / {FEEDBACK_MESSAGE_MAX_LENGTH}
            </p>
          </div>

          <div className={styles.foot}>
            <button type="submit" className={styles.send} disabled={sendDisabled}>
              Send feedback →
            </button>
          </div>
        </form>
      </div>

      <Footer className={styles.pageFooter} />
      <Toast
        message={toast?.message}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}

export async function getStaticProps() {
  return getDocumentShellStaticProps();
}
