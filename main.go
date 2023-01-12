package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path"
	"regexp"
	"strings"
)

func main() {
	expands := readRepoExpand()
	f, err := os.Create("index.json")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()
	b, err := json.MarshalIndent(expands, "", " ")
	if err != nil {
		log.Fatal(err)
	}
	f.Write(b)

	f2, err2 := os.Create("README.md")
	if err2 != nil {
		log.Fatal(err)
	}
	defer f2.Close()

	readme := `
# Miru-Repo

这里是Miru的官方仓库

## 仓库列表
|  名称   | 包名 | 版本 | 查看 |
|  ----   | ---- | --- | ---  |
`

	for _, v := range expands {
		url := fmt.Sprintf("[查看](%s)", "/blob/main/repo/"+v["url"])
		readme += fmt.Sprintf("| %s | %s | %s | %s |\n", v["name"], v["package"], v["version"], url)
	}
	f2.WriteString(readme)
}

func readRepoExpand() []map[string]string {
	de, err := os.ReadDir("repo")
	if err != nil {
		log.Fatal(err)
	}
	var expands []map[string]string
	for _, de2 := range de {
		b, err := os.ReadFile(path.Join("repo", de2.Name()))
		if err != nil {
			log.Println("error:", err)
			continue
		}
		r, _ := regexp.Compile(`MiruUserScript([\s\S]+?)/MiruUserScript`)
		data := r.FindAllString(string(b), -1)
		if len(data) < 1 {
			log.Println("error: not expand")
			continue
		}
		lines := strings.Split(data[0], "\n")
		expand := make(map[string]string)
		for _, v := range lines {
			if v[:4] == "// @" {
				s := strings.Split(v[4:], " ")
				expand[s[0]] = strings.Trim(s[len(s)-1], "\r")
			}
		}
		expand["url"] = de2.Name()
		expands = append(expands, expand)
	}
	return expands
}
