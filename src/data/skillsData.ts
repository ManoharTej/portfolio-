export interface ItemProps {
  title: string;
  iconUrl?: string;
  isTextBased?: boolean;
  description: string;
}

export const skillsData: ItemProps[] = [
  { 
    title: "Vibe Coding", 
    isTextBased: true,
    description: "I use Vibe Coding to rapidly prototype ideas, generating functional code at the speed of thought by collaborating organically with AI tools."
  },
  { 
    title: "Python", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-plain.svg",
    description: "I use Python as my primary backend language for building data-intensive APIs, automating workflows, and running machine learning models."
  },
  { 
    title: "JavaScript", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-plain.svg",
    description: "I use JavaScript to breathe life into web applications, handling complex DOM manipulations and seamless asynchronous data fetching."
  },
  { 
    title: "React", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
    description: "I use React to construct scalable, component-driven user interfaces. It's my go-to framework for stateful web apps."
  },
  { 
    title: "TypeScript", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg",
    description: "I use TypeScript everywhere to catch bugs at compile-time and provide rock-solid autocomplete features across my entire stack."
  },
  { 
    title: "Next.js", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-plain.svg",
    description: "I use Next.js when I need lightning-fast SEO optimization, utilizing its hybrid static rendering and server-side rendering."
  },
  { 
    title: "Three.js", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg",
    description: "I use Three.js and React Three Fiber to build immersive 3D experiences in the browser, exactly like the portfolio you're in right now!"
  },
  {
    title: "Tailwind CSS",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
    description: "I use Tailwind to rapidly style components without ever leaving my HTML, allowing for beautiful, responsive designs in record time."
  },
  {
    title: "HTML5",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
    description: "I use HTML5 to structure highly semantic, accessible web documents that form the structural foundation of all my projects."
  },
  {
    title: "CSS3",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
    description: "I use CSS3 to breathe life into layouts, utilizing advanced Flexbox, Grid, and smooth keyframe animations to create stunning UIs."
  }
];

export const toolsData: ItemProps[] = [
  { 
    title: "VS Code", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-plain.svg",
    description: "I use VS Code as my daily driver IDE. With a heavily customized setup, I write and debug code seamlessly."
  },
  { 
    title: "Obsidian", 
    iconUrl: "/obsidian.svg",
    description: "I use Obsidian as my second brain. I heavily rely on markdown and bidirectional linking to map out complex architectures and ideas."
  },
  { 
    title: "Git", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-plain.svg",
    description: "I use Git to safely manage source code versions, coordinate with teams, and deploy continuous integration pipelines."
  },
  { 
    title: "Docker", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-plain.svg",
    description: "I use Docker to containerize all my applications, guaranteeing that 'it works on my machine' translates perfectly to production."
  },
  { 
    title: "Node.js", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-plain.svg",
    description: "I use Node.js to spin up lightweight, ultra-fast servers that share the exact same JavaScript ecosystem as my frontend code."
  },
  { 
    title: "MongoDB", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-plain.svg",
    description: "I use MongoDB as my primary NoSQL database for projects that require highly flexible and scalable data schemas."
  },
  {
    title: "Figma",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",
    description: "I use Figma to rapidly wireframe user interfaces and prototype interactions before writing a single line of CSS."
  },
  {
    title: "GitHub",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
    description: "I use GitHub to collaborate on open-source projects, manage issues, and utilize Actions for automated CI/CD workflows."
  },
  {
    title: "Antigravity",
    iconUrl: "/antigravity.svg",
    description: "I use Antigravity IDE to pair-program with advanced AI agents, rapidly prototyping features and seamlessly debugging complex errors."
  },
  {
    title: "Vite",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vite/vite-original.svg",
    description: "I use Vite as my primary build tool to experience lightning-fast Hot Module Replacement and highly optimized production bundles."
  }
];

export const certsData: ItemProps[] = [
  { 
    title: "Google Cloud", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg",
    description: "I use Google Cloud to host my large-scale applications, utilizing App Engine, Cloud Run, and their advanced AI APIs."
  },
  { 
    title: "AWS Certified", 
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg",
    description: "I use AWS to architect enterprise-grade, highly available infrastructure utilizing S3, EC2, and serverless Lambda functions."
  }
];
