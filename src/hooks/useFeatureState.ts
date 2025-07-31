import React, { Dispatch, SetStateAction } from "react";

type SnackbarState = { open: boolean, message: string, severity: "success" | "error" | "warning" | "info" | undefined }

const useFeatureState = (): [SnackbarState, Dispatch<SetStateAction<SnackbarState>>] => {
    const [state, setState] = React.useState<SnackbarState>({ open: false, message: "", severity: undefined });
    return [state, setState]
}
export const useFeatureStateSnackbar = (): [SnackbarState, Dispatch<SetStateAction<SnackbarState>>] => {
    const [state, setState] = React.useState<SnackbarState>({ open: false, message: "", severity: undefined });
    return [state, setState]
} 

export default useFeatureState;