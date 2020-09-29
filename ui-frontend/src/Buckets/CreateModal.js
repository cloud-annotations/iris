import React, { useState, useEffect, useCallback } from "react";
import { Modal, TextInput, Loading } from "carbon-components-react";

import COS from "src/api/COSv2";
import { defaultEndpoint } from "src/endpoints";

const transitionEndEventName = (() => {
  const el = document.createElement("div");
  const transitions = {
    transition: "transitionend",
    OTransition: "otransitionend", // oTransitionEnd in very old Opera
    MozTransition: "transitionend",
    WebkitTransition: "webkitTransitionEnd",
  };

  for (let i in transitions) {
    if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
      return transitions[i];
    }
  }
})();

// REGEX.
const combineRegex = (reg1, reg2) => RegExp(`${reg1.source}|${reg2.source}`);
const ALPHANUMERIC_DOT_DASH = /[^a-z0-9-.]|[.-][.-]+/;
const STARTS_ALPHANUMERIC = /^[^a-z0-9]+/;
const ENDS_ALPHANUMERIC = /[^a-z0-9]+$/;
const BASE_NAME = combineRegex(STARTS_ALPHANUMERIC, ALPHANUMERIC_DOT_DASH);
const FULL_NAME = combineRegex(ENDS_ALPHANUMERIC, BASE_NAME);

// Error Messages.
const INVALID_CHARS =
  "Must start and end in alphanumeric characters (from 3 to 255) limited to: lowercase, numbers and non-consecutive dots, and hyphens.";
const NAME_EXISTS =
  "This bucket name already exists in IBM Cloud Object Storage. Create a new globally unique name.";
const TOO_SHORT = "Must be at least 3 characters.";
const EMPTY_NAME = "Bucket name is required.";

const CreateModal = ({ isOpen, onClose, onSubmit, instanceId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [textInputValue, setTextInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (isOpen) {
    const modal = document.getElementById("create-bucket-modal");
    const input = document.getElementById("create-bucket-modal-text-input");
    if (modal && input) {
      modal.addEventListener(transitionEndEventName, () => {
        input.focus();
      });
    }
  }

  useEffect(() => {
    // Only allow alphanumeric characters and 1 (`.` or `-`) in a row.
    if (BASE_NAME.test(textInputValue)) {
      setErrorMessage(INVALID_CHARS);
    } else {
      setErrorMessage("");
    }
  }, [textInputValue]);

  const handleTextInputChange = useCallback(({ target: { value } }) => {
    // Replace any spaces.
    const cleanedText = value.toLowerCase().trim().replace(/\s/g, "") || "";
    setTextInputValue(cleanedText);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (textInputValue === "") {
      setErrorMessage(EMPTY_NAME);
      return;
    }

    if (textInputValue.length < 3) {
      setErrorMessage(TOO_SHORT);
      return;
    }

    // Make sure the name doesn't end with a non alphanumeric character
    if (FULL_NAME.test(textInputValue)) {
      setErrorMessage(INVALID_CHARS);
      return;
    }

    setIsLoading(true);

    try {
      await new COS({ endpoint: defaultEndpoint }).createBucket({
        Bucket: textInputValue,
        IBMServiceInstanceId: instanceId,
      });
      setErrorMessage("");
      setTextInputValue("");
      onSubmit(textInputValue);
    } catch (error) {
      switch (error.message) {
        case "Conflict":
          setErrorMessage(NAME_EXISTS);
          break;
        default:
          setErrorMessage(error.message);
          break;
      }
    }
    setIsLoading(false);
  }, [instanceId, onSubmit, textInputValue]);

  const handleClose = useCallback(() => {
    setErrorMessage("");
    setTextInputValue("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      id="create-bucket-modal"
      open={isOpen}
      shouldSubmitOnEnter
      modalHeading="Bucket name"
      primaryButtonText="Confirm"
      secondaryButtonText="Cancel"
      onRequestClose={handleClose}
      onRequestSubmit={handleSubmit}
      onSecondarySubmit={handleClose}
    >
      <Loading active={isLoading} />
      <TextInput
        placeholder="Name"
        onChange={handleTextInputChange}
        value={textInputValue}
        invalidText={errorMessage}
        invalid={errorMessage !== ""}
        id="create-bucket-modal-text-input"
      />
    </Modal>
  );
};

export default CreateModal;
