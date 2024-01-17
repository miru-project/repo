package main

import (
	"net/http"
	"time"
	"fmt"
)

func checkWebsiteStatus(url string) int {
    client := http.Client{
        Timeout: time.Second * 10,
    }
    resp, err := client.Get(url)
    if err != nil {
        fmt.Printf("Error checking website %s: %v\n", url, err)
        return 0
    }
    fmt.Printf("Website %s returned status code %d\n", url, resp.StatusCode)
    if resp.StatusCode != 200 {
        return 0
    }
    return 1
}