package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path"
	"regexp"
	"strings"
    "strconv"
)

func main() {
	extensions := readRepoExtensions()
	

	f2, err2 := os.Create("README.md")
	if err2 != nil {
		log.Fatal(err2)
	}
	defer f2.Close()

	readme := `
# Miru-Repo

Miru extensions repository | [Miru App Download](https://github.com/miru-project/miru-app) |

## List
|  Name   | Package | Version | Author | Language | Type | Status | Source |
|  ----   | ---- | --- | ---  | ---  | --- | --- | --- |
`

	for _, v := range extensions {
		v["status"] = strconv.Itoa(checkWebsiteStatus(v["webSite"]))
		url := fmt.Sprintf("[Source Code](%s)", "https://github.com/miru-project/repo/blob/main/repo/"+v["url"])
		nsfw := v["nsfw"] == "true"
		if nsfw {
			continue
		}
		status := "Down"
        if v["status"] == "1" {
            status = "Ok"
        }
        readme += fmt.Sprintf("| %s | %s | %s | %s | %s | %s | %s | %s |\n", v["name"], v["package"], v["version"], v["author"], v["lang"], v["type"], status, url)
	}
	f2.WriteString(readme)

	f, err := os.Create("index.json")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()
	b, err := json.MarshalIndent(extensions, "", " ")
	if err != nil {
		log.Fatal(err)
	}
	f.Write(b)
}

func readRepoExtensions() []map[string]string {
	de, err := os.ReadDir("repo")
	if err != nil {
		log.Fatal(err)
	}
	var extensions []map[string]string
	for _, de2 := range de {
		b, err := os.ReadFile(path.Join("repo", de2.Name()))
		if err != nil {
			log.Println("error:", err)
			continue
		}
		r, _ := regexp.Compile(`MiruExtension([\s\S]+?)/MiruExtension`)
		data := r.FindAllString(string(b), -1)
		if len(data) < 1 {
			log.Println("error: not extension")
			continue
		}
		lines := strings.Split(data[0], "\n")
		extension := make(map[string]string)
		for _, v := range lines {
			if v[:4] == "// @" {
				s := strings.Split(v[4:], " ")
				extension[s[0]] = strings.Trim(s[len(s)-1], "\r")
			}
		}
		extension["url"] = de2.Name()
		extensions = append(extensions, extension)
	}
	return extensions
}
