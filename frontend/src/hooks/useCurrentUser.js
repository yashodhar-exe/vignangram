import { useEffect } from "react";
import { useState } from "react";

import api from "../api/axios";

import {
    getCurrentUserEmail
} from "../utils/auth";

function useCurrentUser() {

    const [user,
        setUser] =
        useState(null);

    useEffect(() => {

        const email =
            getCurrentUserEmail();

        if (!email)
            return;

        api.get(
            `/users/email/${email}`
        ).then((res) => {

            setUser(
                res.data
            );
        });

    }, []);

    return user;
}

export default useCurrentUser;