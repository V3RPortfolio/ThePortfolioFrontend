export interface Credit {
    title: string;
    subtitle?: string;
    prefixNote?: string;
    suffixNote?: string[];
    link?: string;

}

export interface CreditGroup {
    title: string;
    credits: Credit[];
    show?: boolean;
    animation: 'fade' | 'scroll';
}

export const credits: CreditGroup[] = [

    {
      title: '',
      animation: 'fade',
      show: true,
      credits: [
        {
          title: 'Hussein Nasser',
          link: 'youtube.com/@hnasr',

          prefixNote: 'Special thanks to ',

          suffixNote: [
            "For the amazing idea on 'Building a Full Backend Portfolio'",
            'Checkout his youtube channel at youtube.com/@hnasr for more amazing content',
          ]
        }
      ]
    },

    {
      title: 'Everyone who made this project possible',
      animation: 'scroll',
      show: true,
      credits: [
        {
          title: '3Blue1Brown',
          subtitle: 'Statistics and Machine Learning',
          link: '3blue1brown.com',
        },
        {
          title: 'Victor Gordan',
          subtitle: 'OpenGL',
          link: 'youtube.com/@VictorGordan',
        },
        {
          title: 'procademy',
          subtitle: 'NestJS and JavaScript',
          link: 'www.youtube.com/@procademy',
        },
        {
          title: 'Alessandro “Alecaddd” Castellani',
          subtitle: 'WordPress and PHP',
          link: 'www.youtube.com/@alecaddd',
        },
        {
          title: 'Codeytek Academy',
          subtitle: 'WordPress and PHP',
          link: 'www.youtube.com/@Codeytek',
        },
        {
          title: 'Net Ninja',
          subtitle: 'Django and Flutter',
          link: 'netninja.dev',
        },
        {
          title: 'CarbonRider',
          subtitle: 'Keycloak and Java',
          link: 'carbonrider.com',
        },
        {
          title: 'Distributed Systems Course',
          subtitle: 'Distributed systems',
          link: 'www.youtube.com/@DistributedSystems',
        },
        {
          title: 'Dive Into Development',
          subtitle: 'Keycloak',
          link: 'www.youtube.com/@diveintodev',
        },
        {
          title: 'Java Brains',
          subtitle: 'Terraform and Java',
          link: 'www.youtube.com/@Java.Brains',
        },
        {
          title: 'Andrej Karpathy',
          subtitle: 'Neural Networks and Large Language Models',
          link: 'www.youtube.com/@AndrejKarpathy',
        },

      ]
    },

    {
      title: 'Special thanks to',
      animation: 'fade',
      show: true,
      credits: [
        
        {
          title: 'The open-source community',
          subtitle: '',

          prefixNote: 'Special thanks to ',

          suffixNote: [
            'For providing the tools and resources that made this project possible'
          ]
        }
      ]
    },
  ];