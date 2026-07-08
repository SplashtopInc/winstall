import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Modal from "react-modal";

import { createPack, fetchMyPacks, updatePack } from "../utils/fetchPackAPI";
import { syncOwnPacksCacheEntry } from "../utils/packHelpers";
import {
  countPublicPacksInList,
  MAX_PUBLIC_PACKS_PER_USER,
  PACK_DESCRIPTION_MAX_LENGTH,
  PACK_NAME_MAX_LENGTH,
  PUBLIC_PACK_LIMIT_MESSAGE,
} from "../utils/packLimits";
import styles from "../styles/createPackModal.module.scss";

Modal.setAppElement("#__next");

const defaultValues = {
  title: "",
  description: "",
  isPublic: false,
};

function toVisibility(isPublic) {
  return isPublic ? "public" : "private";
}

function packToFormValues(pack) {
  return {
    title: pack.name || "",
    description: pack.description || "",
    isPublic: pack.visibility === "public",
  };
}

export default function CreatePackModal({ isOpen, onClose, user, onCreated, pack }) {
  const isEditMode = Boolean(pack);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [publicPackCount, setPublicPackCount] = useState(0);
  const isPublic = watch("isPublic");
  const title = watch("title");
  const description = watch("description");
  const isPublicRegister = register("isPublic");
  const isAlreadyPublic = isEditMode && pack.visibility === "public";
  const publicLimitReached =
    publicPackCount >= MAX_PUBLIC_PACKS_PER_USER && !isAlreadyPublic;
  const publicCheckboxDisabled = submitting || publicLimitReached;

  const checkboxIcon = submitting || publicLimitReached
    ? isPublic
      ? "/assets/cb_check_disable.svg"
      : "/assets/cb_uncheck_disable.svg"
    : isPublic
      ? "/assets/cb_check.svg"
      : "/assets/cb_uncheck.svg";

  useEffect(() => {
    if (!isOpen) return;

    if (pack) {
      reset(packToFormValues(pack));
    } else {
      reset(defaultValues);
    }

    setError("");
  }, [isOpen, pack, reset]);

  useEffect(() => {
    if (!isOpen || !user) {
      setPublicPackCount(0);
      return;
    }

    let cancelled = false;

    fetchMyPacks().then(({ response }) => {
      if (cancelled) return;
      setPublicPackCount(countPublicPacksInList(response));
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, user]);

  const handleClose = () => {
    if (submitting) return;
    reset(defaultValues);
    setError("");
    onClose();
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError("");

    const payload = {
      name: values.title,
      description: values.description,
      visibility: toVisibility(values.isPublic),
    };

    const { response, error: apiError } = isEditMode
      ? await updatePack(pack._id, payload)
      : await createPack(payload);

    setSubmitting(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    if (response) {
      syncOwnPacksCacheEntry(response);
      reset(defaultValues);
      setError("");
      onCreated(response);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
      contentLabel={isEditMode ? "Edit pack" : "Create a pack"}
    >
      <div className={styles.header}>
        <h2>{isEditMode ? "Edit pack" : "Create a pack"}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <label className={styles.field}>
          <span className={styles.fieldHeader}>
            Pack title
            <span className={styles.charCount} aria-live="polite">
              {(title || "").length}/{PACK_NAME_MAX_LENGTH}
            </span>
          </span>
          <input
            type="text"
            placeholder="Give your pack a name"
            autoComplete="off"
            maxLength={PACK_NAME_MAX_LENGTH}
            {...register("title", {
              required: "Please enter a name for your pack.",
              maxLength: {
                value: PACK_NAME_MAX_LENGTH,
                message: `Pack name must be ${PACK_NAME_MAX_LENGTH} characters or fewer.`,
              },
              validate: (value) =>
                value.replace(/\s/g, "").length > 0 ||
                "Please enter a name for your pack.",
            })}
          />
          {errors.title && (
            <span className={styles.fieldError}>{errors.title.message}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.fieldHeader}>
            Pack description
            <span className={styles.charCount} aria-live="polite">
              {(description || "").length}/{PACK_DESCRIPTION_MAX_LENGTH}
            </span>
          </span>
          <textarea
            placeholder="Give your pack a short description"
            autoComplete="off"
            maxLength={PACK_DESCRIPTION_MAX_LENGTH}
            {...register("description", {
              required: "Please enter a description for your pack.",
              maxLength: {
                value: PACK_DESCRIPTION_MAX_LENGTH,
                message: `Description must be ${PACK_DESCRIPTION_MAX_LENGTH} characters or fewer.`,
              },
              validate: (value) =>
                value.replace(/\s/g, "").length > 0 ||
                "Please enter a description for your pack.",
            })}
          />
          {errors.description && (
            <span className={styles.fieldError}>{errors.description.message}</span>
          )}
        </label>

        <div className={styles.checkboxContainer}>
          <label>
            <span className={styles.checkbox}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                disabled={publicCheckboxDisabled}
                {...isPublicRegister}
              />
              <img
                src={checkboxIcon}
                alt=""
                aria-hidden="true"
                className={styles.checkboxIcon}
                width={17}
                height={17}
              />
            </span>
            <p>Public pack</p>
          </label>
          <em>
            {publicLimitReached
              ? PUBLIC_PACK_LIMIT_MESSAGE
              : "Appears in the public App Packs directory for anyone to discover."}
          </em>
        </div>

        {error && <p className={styles.apiError}>{error}</p>}

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update"
                : "Create Pack"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
