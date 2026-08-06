export function groupEvents(events: any[]) {

  return Object.values(

    events.reduce((acc: any, event: any) => {

      const key = `${event.date}_${event.title}_${event.category}`;

      if (!acc[key]) {

        acc[key] = {

          ...event,

          sources: [{

            source: event.source,

            url: event.url

          }]

        };

      } else {

        acc[key].sources.push({

          source: event.source,

          url: event.url

        });

      }

      return acc;

    }, {})

  );

}